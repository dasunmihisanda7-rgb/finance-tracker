import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TransactionSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const transactions = await db.getAll(userId);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('API GET /api/transactions failed:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const result = TransactionSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((err) => err.message).join(", ");
      return NextResponse.json(
        { error: errorMsg, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, category, amount, date, description } = result.data;

    const newTx = await db.add({
      type,
      category,
      amount,
      date,
      description,
    }, userId);

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error('API POST /api/transactions failed:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
