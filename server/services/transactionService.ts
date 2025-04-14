
import { storage } from '../storage';
import { InsertTransaction, InsertTransactionItem } from '@shared/schema';

export class TransactionService {
  async calculateTotals(items: InsertTransactionItem[]) {
    let totalAmount = 0;
    let totalTaxAmount = 0;

    for (const item of items) {
      const amount = parseFloat(item.amount.toString());
      const taxAmount = parseFloat(item.taxAmount?.toString() || '0');
      
      totalAmount += amount;
      totalTaxAmount += taxAmount;
    }

    return {
      totalAmount,
      totalTaxAmount,
      grandTotal: totalAmount + totalTaxAmount
    };
  }

  async validateTransaction(transaction: InsertTransaction) {
    // Add business validation rules
    if (!transaction.transactionDate) {
      throw new Error('Transaction date is required');
    }

    if (!transaction.partyId) {
      throw new Error('Party is required');
    }

    if (parseFloat(transaction.amount.toString()) <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }
  }
}
