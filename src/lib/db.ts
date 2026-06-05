import { Transaction } from '../types';
import prisma from './prisma';

export interface TransactionRepository {
  getAll(userId: string): Promise<Transaction[]>;
  add(tx: Omit<Transaction, 'id'>, userId: string): Promise<Transaction>;
  update(tx: Transaction, userId: string): Promise<Transaction>;
  delete(id: string, userId: string): Promise<boolean>;
}

class PostgresTransactionRepository implements TransactionRepository {
  async getAll(userId: string): Promise<Transaction[]> {
    try {
      const txs = await prisma.transaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
      });
      return txs.map((t) => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        category: t.category,
        amount: t.amount,
        date: t.date,
        description: t.description,
      }));
    } catch (error) {
      console.error('Error fetching transactions from Postgres:', error);
      return [];
    }
  }

  async add(txData: Omit<Transaction, 'id'>, userId: string): Promise<Transaction> {
    try {
      const newTx = await prisma.transaction.create({
        data: {
          type: txData.type,
          category: txData.category,
          amount: txData.amount,
          date: txData.date,
          description: txData.description,
          userId,
        },
      });
      return {
        id: newTx.id,
        type: newTx.type as 'income' | 'expense',
        category: newTx.category,
        amount: newTx.amount,
        date: newTx.date,
        description: newTx.description,
      };
    } catch (error) {
      console.error('Error adding transaction to Postgres:', error);
      throw new Error('Database write failure');
    }
  }

  async update(tx: Transaction, userId: string): Promise<Transaction> {
    try {
      const updated = await prisma.transaction.update({
        where: { id: tx.id, userId },
        data: {
          type: tx.type,
          category: tx.category,
          amount: tx.amount,
          date: tx.date,
          description: tx.description,
        },
      });
      return {
        id: updated.id,
        type: updated.type as 'income' | 'expense',
        category: updated.category,
        amount: updated.amount,
        date: updated.date,
        description: updated.description,
      };
    } catch (error) {
      console.error('Error updating transaction in Postgres:', error);
      throw new Error('Database write failure');
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.transaction.delete({
        where: { id, userId },
      });
      return true;
    } catch (error) {
      console.error('Error deleting transaction from Postgres:', error);
      return false;
    }
  }
}

// Export the active repository instance.
// Now pointing to the SQL Postgres implementation.
export const db: TransactionRepository = new PostgresTransactionRepository();
