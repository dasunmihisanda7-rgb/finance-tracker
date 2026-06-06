import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TransactionSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
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

    const updatedTx = await db.update({
      id,
      type,
      category,
      amount,
      date,
      description,
    }, userId);

    return NextResponse.json(updatedTx);
  } catch (error) {
    console.error(`API PUT /api/transactions/[id] failed for ID:`, error);
    const message = error instanceof Error ? error.message : '';
    if (message && message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    const success = await db.delete(id, userId);
    
    if (!success) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(`API DELETE /api/transactions/[id] failed for ID:`, error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
