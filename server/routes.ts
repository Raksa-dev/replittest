import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPartySchema, insertItemSchema, insertTransactionSchema, insertTransactionItemSchema, insertBnplLimitSchema, insertTallySyncLogSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler middleware
  const handleError = (err: Error, res: Response) => {
    console.error(err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: fromZodError(err).message
      });
    }
    
    res.status(500).json({ message: err.message || "Internal Server Error" });
  };

  // Helper for parsing IDs
  const parseId = (id: string): number => {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error("Invalid ID format");
    }
    return parsed;
  };
  
  // User management
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Dashboard data
  app.get('/api/dashboard', async (req: Request, res: Response) => {
    try {
      // Mock user ID 1 for demo purposes
      const userId = 1;
      
      const openPayables = await storage.getOpenPayables(userId);
      const openReceivables = await storage.getOpenReceivables(userId);
      const recentTransactions = await storage.getRecentTransactions(userId, 5);
      const receivablesAgeing = await storage.getReceivablesAgeing(userId);
      const payablesAgeing = await storage.getPayablesAgeing(userId);
      const purchaseBnplLimits = await storage.getBnplLimitsByType(userId, 'purchase');
      const salesBnplLimits = await storage.getBnplLimitsByType(userId, 'sales');
      const recentSyncLog = await storage.getRecentTallySyncLog(userId);
      
      // Get pending sync counts
      const pendingInvoices = 5; // In a real app, this would be calculated
      const pendingPayments = 3;
      const pendingReceipts = 2;
      
      res.json({
        openPayables,
        openReceivables,
        recentTransactions,
        receivablesAgeing,
        payablesAgeing,
        purchaseBnplLimits,
        salesBnplLimits,
        recentSyncLog,
        pendingSyncs: {
          invoices: pendingInvoices,
          payments: pendingPayments,
          receipts: pendingReceipts
        }
      });
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Parties (Customers/Vendors)
  app.get('/api/parties', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const type = req.query.type as string | undefined;
      
      if (type) {
        const parties = await storage.getPartiesByType(userId, type);
        res.json(parties);
      } else {
        const parties = await storage.getPartiesByUserId(userId);
        res.json(parties);
      }
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.get('/api/parties/:id', async (req: Request, res: Response) => {
    try {
      const partyId = parseId(req.params.id);
      const party = await storage.getParty(partyId);
      
      if (!party) {
        return res.status(404).json({ message: "Party not found" });
      }
      
      res.json(party);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.post('/api/parties', async (req: Request, res: Response) => {
    try {
      const partyData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(partyData);
      res.status(201).json(party);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.patch('/api/parties/:id', async (req: Request, res: Response) => {
    try {
      const partyId = parseId(req.params.id);
      const partyData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(partyId, partyData);
      res.json(party);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Items
  app.get('/api/items', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const items = await storage.getItemsByUserId(userId);
      res.json(items);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.get('/api/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseId(req.params.id);
      const item = await storage.getItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.post('/api/items', async (req: Request, res: Response) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      res.status(201).json(item);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.patch('/api/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseId(req.params.id);
      const itemData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(itemId, itemData);
      res.json(item);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // E-commerce and Marketplace endpoints
  app.get('/api/marketplace/items', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const items = await storage.getItemsWithListings(userId);
      res.json(items);
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  app.get('/api/marketplace/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const items = await storage.getFeatureProducts(limit);
      res.json(items);
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  app.patch('/api/marketplace/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseId(req.params.id);
      const item = await storage.getItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const userId = 1; // Mock user ID
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this item" });
      }
      
      // This endpoint specifically updates the e-commerce/marketplace-related fields
      const listingData = insertItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateItemListing(itemId, listingData);
      res.json(updatedItem);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Transactions
  app.get('/api/transactions', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const type = req.query.type as string | undefined;
      const partyId = req.query.partyId ? parseId(req.query.partyId as string) : undefined;
      
      if (type && !partyId) {
        const transactions = await storage.getTransactionsByType(userId, type);
        res.json(transactions);
      } else if (partyId) {
        const transactions = await storage.getTransactionsByPartyId(userId, partyId);
        res.json(transactions);
      } else {
        const transactions = await storage.getTransactionsByUserId(userId);
        res.json(transactions);
      }
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.get('/api/transactions/:id', async (req: Request, res: Response) => {
    try {
      const transactionId = parseId(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const items = await storage.getTransactionItemsByTransactionId(transactionId);
      
      res.json({
        ...transaction,
        items
      });
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  // Endpoint to get only transaction items for a specific transaction
  app.get('/api/transactions/:id/items', async (req: Request, res: Response) => {
    try {
      const transactionId = parseId(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const items = await storage.getTransactionItemsByTransactionId(transactionId);
      res.json(items);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
      const { transaction, items } = req.body;
      
      // With z.coerce.date() in the schema, we don't need to manually convert dates
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
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.patch('/api/transactions/:id', async (req: Request, res: Response) => {
    try {
      const transactionId = parseId(req.params.id);
      
      // With z.coerce.date() in the schema, we don't need to manually convert dates
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(transactionId, transactionData);
      res.json(transaction);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // BNPL Limits
  app.get('/api/bnpl-limits', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const type = req.query.type as string | undefined;
      const partyId = req.query.partyId ? parseId(req.query.partyId as string) : undefined;
      
      if (type) {
        const limits = await storage.getBnplLimitsByType(userId, type);
        res.json(limits);
      } else if (partyId) {
        const limits = await storage.getBnplLimitsByPartyId(partyId);
        res.json(limits);
      } else {
        const limits = await storage.getBnplLimitsByUserId(userId);
        res.json(limits);
      }
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.post('/api/bnpl-limits', async (req: Request, res: Response) => {
    try {
      // With z.coerce.date() in the schema, the date field will be automatically converted
      const limitData = insertBnplLimitSchema.parse(req.body);
      const limit = await storage.createBnplLimit(limitData);
      res.status(201).json(limit);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.patch('/api/bnpl-limits/:id', async (req: Request, res: Response) => {
    try {
      const limitId = parseId(req.params.id);
      // With z.coerce.date() in the schema, the date field will be automatically converted
      const limitData = insertBnplLimitSchema.partial().parse(req.body);
      const limit = await storage.updateBnplLimit(limitId, limitData);
      res.json(limit);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Tally Sync
  app.get('/api/tally-sync/logs', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const logs = await storage.getTallySyncLogs(userId);
      res.json(logs);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.get('/api/tally-sync/latest', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const log = await storage.getRecentTallySyncLog(userId);
      
      if (!log) {
        return res.status(404).json({ message: "No sync logs found" });
      }
      
      res.json(log);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.post('/api/tally-sync', async (req: Request, res: Response) => {
    try {
      const { syncType } = req.body;
      
      // Simulate Tally sync process
      const syncLog = {
        syncType: syncType || "pull",
        syncStatus: "success",
        transactionCount: Math.floor(Math.random() * 50) + 10,
        details: `Successfully ${syncType || "pull"}ed transactions with Tally`,
        userId: 1 // Mock user ID
      };
      
      const log = await storage.createTallySyncLog(insertTallySyncLogSchema.parse(syncLog));
      res.status(201).json(log);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Inventory API
  app.get('/api/inventory/summary', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const items = await storage.getItemsByUserId(userId);
      
      // Calculate summary data
      let totalValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      
      items.forEach(item => {
        const openingStock = item.openingStock ? parseFloat(item.openingStock) : 0;
        const sellingPrice = item.sellingPrice ? parseFloat(item.sellingPrice) : 0;
        const minStockLevel = item.minStockLevel ? parseFloat(item.minStockLevel) : 0;
        
        totalValue += openingStock * sellingPrice;
        
        if (openingStock <= 0) {
          outOfStockCount++;
        } else if (minStockLevel > 0 && openingStock <= minStockLevel) {
          lowStockCount++;
        }
      });
      
      res.json({
        totalItems: items.length,
        totalValue,
        lowStockCount,
        outOfStockCount
      });
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  // Stock Groups API
  app.get('/api/inventory/stock-groups', async (req: Request, res: Response) => {
    try {
      // Mock data for now until we add stock groups to the schema
      res.json([
        { id: 1, name: 'Raw Materials', parentName: null, hsnCode: '3926', gstRate: 18, userId: 1 },
        { id: 2, name: 'Finished Goods', parentName: null, hsnCode: '9403', gstRate: 12, userId: 1 },
        { id: 3, name: 'Packaging', parentName: null, hsnCode: '4819', gstRate: 5, userId: 1 }
      ]);
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  // Godowns API
  app.get('/api/inventory/godowns', async (req: Request, res: Response) => {
    try {
      // Mock data for now until we add godowns to the schema
      res.json([
        { id: 1, name: 'Main Warehouse', parentName: null, address: '123 Industrial Area, Mumbai', userId: 1 },
        { id: 2, name: 'Delhi Branch', parentName: null, address: '456 Distribution Center, Delhi', userId: 1 },
        { id: 3, name: 'Finished Goods Section', parentName: 'Main Warehouse', address: null, userId: 1 }
      ]);
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  // Units API
  app.get('/api/inventory/units', async (req: Request, res: Response) => {
    try {
      // Mock data for now until we add units to the schema
      res.json([
        { id: 1, symbol: 'PCS', formalName: 'Pieces', uqcFrom: 'GST', uqc: 'PCS', userId: 1 },
        { id: 2, symbol: 'KG', formalName: 'Kilograms', uqcFrom: 'GST', uqc: 'KGS', userId: 1 },
        { id: 3, symbol: 'LTR', formalName: 'Liters', uqcFrom: 'GST', uqc: 'LTR', userId: 1 },
        { id: 4, symbol: 'BOX', formalName: 'Box', uqcFrom: 'GST', uqc: 'BOX', userId: 1 }
      ]);
    } catch (err) {
      handleError(err as Error, res);
    }
  });
  
  // Items specific to inventory with separate endpoint
  app.get('/api/inventory/items', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const recent = req.query.recent === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let items = await storage.getItemsByUserId(userId);
      
      // Add mock inventory data for UI purposes
      items = items.map(item => ({
        ...item,
        // These are UI display properties not in the actual DB schema
        quantitySold: Math.floor(Math.random() * 100),
        quantityInStock: item.openingStock ? parseInt(item.openingStock) : 0,
        salesValue: Math.floor(Math.random() * 10000),
        price: item.sellingPrice ? parseFloat(item.sellingPrice) : 0,
        costPrice: item.purchasePrice ? parseFloat(item.purchasePrice) : 0,
        gstRate: Math.floor(Math.random() * 4) * 5, // 0, 5, 10, 15%
      }));
      
      if (recent && limit) {
        items = items.slice(0, limit);
      }
      
      res.json(items);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  // Ageing Analysis
  app.get('/api/ageing/receivables', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const ageing = await storage.getReceivablesAgeing(userId);
      res.json(ageing);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  app.get('/api/ageing/payables', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const ageing = await storage.getPayablesAgeing(userId);
      res.json(ageing);
    } catch (err) {
      handleError(err as Error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
