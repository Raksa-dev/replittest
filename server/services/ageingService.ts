
import { storage } from '../storage';
import { Transaction } from '@shared/schema';

export class AgeingService {
  async calculateAgeing(transactions: Transaction[]) {
    const now = new Date();
    const result = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };

    transactions.forEach(transaction => {
      if (!transaction.dueDate) return;
      
      const dueDate = new Date(transaction.dueDate);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const balanceDue = parseFloat(transaction.balanceDue?.toString() || '0');
      
      if (diffDays <= 0) {
        result.current += balanceDue;
      } else if (diffDays <= 30) {
        result.days1to30 += balanceDue;
      } else if (diffDays <= 60) {
        result.days31to60 += balanceDue;
      } else {
        result.days60plus += balanceDue;
      }
    });

    return result;
  }
}
