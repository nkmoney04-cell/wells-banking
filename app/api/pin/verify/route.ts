import { scryptSync, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { pin } = await request.json();
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN.' }, { status: 400 });
    }

    const { auth, db } = getFirebaseAdmin();
    const token = await auth.verifyIdToken(authorization.slice('Bearer '.length));
    const pinRef = db.doc(`users/${token.uid}/security/pin`);
    const snapshot = await pinRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'No transaction PIN has been created.' }, { status: 404 });
    }

    const data = snapshot.data()!;
    const lockedUntil = data.lockedUntil ? new Date(data.lockedUntil).getTime() : 0;
    if (lockedUntil > Date.now()) {
      return NextResponse.json({ error: 'PIN temporarily locked. Try again later.' }, { status: 423 });
    }

    const actual = Buffer.from(data.hash, 'hex');
    const supplied = scryptSync(pin, data.salt, 64);
    const valid = actual.length === supplied.length && timingSafeEqual(actual, supplied);

    if (!valid) {
      const attempts = Number(data.attempts || 0) + 1;
      const lockout =
        attempts >= 5
          ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), attempts: 0 }
          : { lockedUntil: null, attempts };
      await pinRef.update(lockout);
      return NextResponse.json({ error: 'Incorrect PIN.' }, { status: 401 });
    }

    await pinRef.update({ attempts: 0, lockedUntil: null });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PIN verification failed', error);
    return NextResponse.json({ error: 'Unable to verify PIN.' }, { status: 500 });
  }
}
