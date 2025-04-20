import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTransactionSchema, insertTransactionItemSchema } from '@shared/schema';

export class TransactionController {
  async createTransaction(req: Request, res: Response) {
    try {
      const { transaction, items } = req.body;

      const transactionData = insertTransactionSchema.parse(transaction);
      const createdTransaction = await storage.createTransaction(transactionData);

      if (items && Array.isArray(items)) {
        for (const item of items) {
          const itemData = {
            ...item,
            transactionId: createdTransaction.id
          };
          await storage.createTransactionItem(insertTransactionItemSchema.parse(itemData));
        }
      }

      const createdItems = await storage.getTransactionItemsByTransactionId(createdTransaction.id);

      res.status(201).json({
        ...createdTransaction,
        items: createdItems
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Add dummy items for testing
      const dummyItems = [
        {
          id: 1,
          transactionId: transactionId,
          itemId: 1,
          description: "Product A",
          quantity: 2,
          rate: "100.00",
          amount: "200.00",
          taxRate: "18",
          taxAmount: "36.00",
          totalAmount: "236.00"
        },
        {
          id: 2,
          transactionId: transactionId,
          itemId: 2,
          description: "Product B",
          quantity: 1,
          rate: "500.00",
          amount: "500.00",
          taxRate: "12",
          taxAmount: "60.00",
          totalAmount: "560.00"
        }
      ];

      res.json({
        ...transaction,
        items: dummyItems,
        amount: "700.00",
        balanceDue: "796.00",
        notes: "Test transaction with items",
        status: "pending"
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(transactionId, transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}