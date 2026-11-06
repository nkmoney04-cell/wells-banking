import { randomBytes, scryptSync } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { pin, confirmation } = await request.json();
    if (!/^\d{4}$/.test(pin) || pin !== confirmation) {
      return NextResponse.json({ error: 'PIN must be 4 digits and both entries must match.' }, { status: 400 });
    }

    if (/^(\d)\1{3}$/.test(pin) || ['0123', '1234', '4321', '3210'].includes(pin)) {
      return NextResponse.json({ error: 'Choose a less predictable PIN.' }, { status: 400 });
    }

    const { auth, db } = getFirebaseAdmin();
    const token = await auth.verifyIdToken(authorization.slice('Bearer '.length));
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(pin, salt, 64).toString('hex');

    await db.doc(`users/${token.uid}/security/pin`).set({
      hash,
      salt,
      attempts: 0,
      lockedUntil: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PIN setup failed', error);
    return NextResponse.json({ error: 'Unable to set PIN.' }, { status: 500 });
  }
}
