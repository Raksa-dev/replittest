
import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTransactionSchema, insertTransactionItemSchema } from '@shared/schema';
import { TransactionService } from '../services/transactionService';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const { transaction, items } = req.body;

      if (!transaction || !items) {
        return res.status(400).json({ message: "Transaction and items are required" });
      }

      const transactionData = insertTransactionSchema.parse(transaction);
      await this.transactionService.validateTransaction(transactionData);

      const createdTransaction = await storage.createTransaction(transactionData);

      const createdItems = [];
      if (Array.isArray(items)) {
        for (const item of items) {
          const itemData = {
            ...item,
            transactionId: createdTransaction.id
          };
          const createdItem = await storage.createTransactionItem(insertTransactionItemSchema.parse(itemData));
          createdItems.push(createdItem);
        }
      }

      const totals = await this.transactionService.calculateTotals(createdItems);
      await storage.updateTransaction(createdTransaction.id, {
        amount: totals.grandTotal,
        balanceDue: totals.grandTotal
      });

      res.status(201).json({
        ...createdTransaction,
        items: createdItems,
        totals
      });
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(400).json({ 
        message: "Failed to create transaction",
        error: error.message 
      });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const items = await storage.getTransactionItemsByTransactionId(transactionId);
      const totals = await this.transactionService.calculateTotals(items);

      res.json({
        ...transaction,
        items,
        totals
      });
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch transaction",
        error: error.message 
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { type, status, startDate, endDate } = req.query;
      const filters = {
        type: type as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const transactions = await storage.getTransactions(filters);
      res.json(transactions);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch transactions",
        error: error.message 
      });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(transactionId, transactionData);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to update transaction",
        error: error.message 
      });
    }
  }
}
