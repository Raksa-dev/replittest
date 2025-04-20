import { 
  User, Party, Item, Transaction, TransactionItem, 
  BnplLimit, TallySyncLog, InsertParty, InsertItem,
  InsertTransaction, InsertTransactionItem, InsertBnplLimit, InsertTallySyncLog
} from '@shared/schema';
import { db } from "./db";
import { eq, and, desc, sql, gte, lt, lte, gt, count } from "drizzle-orm";
import { log } from "./vite";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Party operations (customers/vendors)
  getParty(id: number): Promise<Party | undefined>;
  getPartiesByUserId(userId: number): Promise<Party[]>;
  getPartiesByType(userId: number, type: string): Promise<Party[]>;
  createParty(party: InsertParty): Promise<Party>;
  updateParty(id: number, party: Partial<InsertParty>): Promise<Party>;
  
  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  getItemsByUserId(userId: number): Promise<Item[]>;
  getItemsWithListings(userId: number): Promise<Item[]>;
  getFeatureProducts(limit?: number): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item>;
  updateItemListing(id: number, listingData: Partial<InsertItem>): Promise<Item>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByType(userId: number, type: string): Promise<Transaction[]>;
  getTransactionsByPartyId(userId: number, partyId: number): Promise<Transaction[]>;
  getRecentTransactions(userId: number, limit: number): Promise<Transaction[]>;
  getOpenPayables(userId: number): Promise<{ total: number, count: number }>;
  getOpenReceivables(userId: number): Promise<{ total: number, count: number }>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  
  // Transaction Item operations
  getTransactionItemsByTransactionId(transactionId: number): Promise<TransactionItem[]>;
  createTransactionItem(transactionItem: InsertTransactionItem): Promise<TransactionItem>;
  
  // BNPL Limit operations
  getBnplLimitsByPartyId(partyId: number): Promise<BnplLimit[]>;
  getBnplLimitsByUserId(userId: number): Promise<BnplLimit[]>;
  getBnplLimitsByType(userId: number, type: string): Promise<BnplLimit[]>;
  createBnplLimit(bnplLimit: InsertBnplLimit): Promise<BnplLimit>;
  updateBnplLimit(id: number, bnplLimit: Partial<InsertBnplLimit>): Promise<BnplLimit>;
  
  // Tally Sync operations
  getTallySyncLogs(userId: number): Promise<TallySyncLog[]>;
  getRecentTallySyncLog(userId: number): Promise<TallySyncLog | undefined>;
  createTallySyncLog(tallySyncLog: InsertTallySyncLog): Promise<TallySyncLog>;
  
  // Ageing Analysis
  getReceivablesAgeing(userId: number): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  }>;
  getPayablesAgeing(userId: number): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  }>;
}

class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private parties: Map<number, Party> = new Map();
  private items: Map<number, Item> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private transactionItems: Map<number, TransactionItem> = new Map();
  private bnplLimits: Map<number, BnplLimit> = new Map();
  private tallySyncLogs: Map<number, TallySyncLog> = new Map();

  private userIdCounter = 1;
  private partyIdCounter = 1;
  private itemIdCounter = 1;
  private transactionIdCounter = 1;
  private transactionItemIdCounter = 1;
  private bnplLimitIdCounter = 1;
  private tallySyncLogIdCounter = 1;

  constructor() {
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Party operations
  async getParty(id: number): Promise<Party | undefined> {
    return this.parties.get(id);
  }
  
  async getPartiesByUserId(userId: number): Promise<Party[]> {
    return Array.from(this.parties.values()).filter(
      (party) => party.userId === userId
    );
  }
  
  async getPartiesByType(userId: number, type: string): Promise<Party[]> {
    return Array.from(this.parties.values()).filter(
      (party) => party.userId === userId && party.type === type
    );
  }
  
  async createParty(insertParty: InsertParty): Promise<Party> {
    const id = this.partyIdCounter++;
    const now = new Date();
    const party: Party = { ...insertParty, id, createdAt: now };
    this.parties.set(id, party);
    return party;
  }
  
  async updateParty(id: number, updates: Partial<InsertParty>): Promise<Party> {
    const party = await this.getParty(id);
    if (!party) {
      throw new Error(`Party with id ${id} not found`);
    }
    
    const updatedParty: Party = { ...party, ...updates };
    this.parties.set(id, updatedParty);
    return updatedParty;
  }
  
  // Item operations
  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }
  
  async getItemsByUserId(userId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getItemsWithListings(userId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.userId === userId && item.isListed === true
    );
  }
  
  async getFeatureProducts(limit: number = 10): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter((item) => item.isListed === true && item.featuredProduct === true)
      .slice(0, limit);
  }
  
  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.itemIdCounter++;
    const now = new Date();
    const item: Item = { ...insertItem, id, createdAt: now };
    this.items.set(id, item);
    return item;
  }
  
  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item> {
    const item = await this.getItem(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    const updatedItem: Item = { ...item, ...updates };
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async updateItemListing(id: number, listingData: Partial<InsertItem>): Promise<Item> {
    const item = await this.getItem(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    // Only update listing-related fields to prevent overwriting inventory data
    const updatedItem: Item = { 
      ...item,
      imageUrl: listingData.imageUrl || item.imageUrl,
      imageUrls: listingData.imageUrls || item.imageUrls,
      isListed: listingData.isListed ?? item.isListed,
      listingDescription: listingData.listingDescription || item.listingDescription,
      listingCategory: listingData.listingCategory || item.listingCategory,
      listingTags: listingData.listingTags || item.listingTags,
      listingStatus: listingData.listingStatus || item.listingStatus,
      mrp: listingData.mrp || item.mrp,
      discountPercentage: listingData.discountPercentage || item.discountPercentage,
      featuredProduct: listingData.featuredProduct ?? item.featuredProduct,
      brandName: listingData.brandName || item.brandName,
      specifications: listingData.specifications || item.specifications,
      ratings: listingData.ratings || item.ratings,
      reviewCount: listingData.reviewCount ?? item.reviewCount,
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }
  
  async getTransactionsByType(userId: number, type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.transactionType === type
    );
  }
  
  async getTransactionsByPartyId(userId: number, partyId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.partyId === partyId
    );
  }
  
  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit);
  }
  
  async getOpenPayables(userId: number): Promise<{ total: number, count: number }> {
    const openPayables = Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.transactionType === "purchase_bill" && 
        ["pending", "overdue", "partially_paid"].includes(transaction.status)
    );
    
    const total = openPayables.reduce((sum, transaction) => sum + Number(transaction.balanceDue || 0), 0);
    return { total, count: openPayables.length };
  }
  
  async getOpenReceivables(userId: number): Promise<{ total: number, count: number }> {
    const openReceivables = Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.transactionType === "sales_invoice" && 
        ["pending", "overdue", "partially_paid"].includes(transaction.status)
    );
    
    const total = openReceivables.reduce((sum, transaction) => sum + Number(transaction.balanceDue || 0), 0);
    return { total, count: openReceivables.length };
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt: now };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const transaction = await this.getTransaction(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    const updatedTransaction: Transaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Transaction Item operations
  async getTransactionItemsByTransactionId(transactionId: number): Promise<TransactionItem[]> {
    return Array.from(this.transactionItems.values()).filter(
      (item) => item.transactionId === transactionId
    );
  }
  
  async createTransactionItem(insertTransactionItem: InsertTransactionItem): Promise<TransactionItem> {
    const id = this.transactionItemIdCounter++;
    const now = new Date();
    const transactionItem: TransactionItem = { ...insertTransactionItem, id, createdAt: now };
    this.transactionItems.set(id, transactionItem);
    return transactionItem;
  }
  
  // BNPL Limit operations
  async getBnplLimitsByPartyId(partyId: number): Promise<BnplLimit[]> {
    return Array.from(this.bnplLimits.values()).filter(
      (limit) => limit.partyId === partyId
    );
  }
  
  async getBnplLimitsByUserId(userId: number): Promise<BnplLimit[]> {
    return Array.from(this.bnplLimits.values()).filter(
      (limit) => limit.userId === userId
    );
  }
  
  async getBnplLimitsByType(userId: number, type: string): Promise<BnplLimit[]> {
    return Array.from(this.bnplLimits.values()).filter(
      (limit) => limit.userId === userId && limit.limitType === type
    );
  }
  
  async createBnplLimit(insertBnplLimit: InsertBnplLimit): Promise<BnplLimit> {
    const id = this.bnplLimitIdCounter++;
    const now = new Date();
    const bnplLimit: BnplLimit = { ...insertBnplLimit, id, createdAt: now };
    this.bnplLimits.set(id, bnplLimit);
    return bnplLimit;
  }
  
  async updateBnplLimit(id: number, updates: Partial<InsertBnplLimit>): Promise<BnplLimit> {
    const bnplLimit = this.bnplLimits.get(id);
    if (!bnplLimit) {
      throw new Error(`BNPL Limit with id ${id} not found`);
    }
    
    const updatedBnplLimit: BnplLimit = { ...bnplLimit, ...updates };
    this.bnplLimits.set(id, updatedBnplLimit);
    return updatedBnplLimit;
  }
  
  // Tally Sync operations
  async getTallySyncLogs(userId: number): Promise<TallySyncLog[]> {
    return Array.from(this.tallySyncLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());
  }
  
  async getRecentTallySyncLog(userId: number): Promise<TallySyncLog | undefined> {
    return Array.from(this.tallySyncLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime())[0];
  }
  
  async createTallySyncLog(insertTallySyncLog: InsertTallySyncLog): Promise<TallySyncLog> {
    const id = this.tallySyncLogIdCounter++;
    const now = new Date();
    const tallySyncLog: TallySyncLog = { ...insertTallySyncLog, id, syncedAt: now };
    this.tallySyncLogs.set(id, tallySyncLog);
    return tallySyncLog;
  }
  
  // Ageing Analysis
  async getReceivablesAgeing(userId: number): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  }> {
    const now = new Date();
    const openReceivables = Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.transactionType === "sales_invoice" && 
        ["pending", "overdue", "partially_paid"].includes(transaction.status)
    );
    
    const result = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };
    
    openReceivables.forEach(transaction => {
      if (!transaction.dueDate) return;
      
      const dueDate = new Date(transaction.dueDate);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        result.current += Number(transaction.balanceDue || 0);
      } else if (diffDays <= 30) {
        result.days1to30 += Number(transaction.balanceDue || 0);
      } else if (diffDays <= 60) {
        result.days31to60 += Number(transaction.balanceDue || 0);
      } else {
        result.days60plus += Number(transaction.balanceDue || 0);
      }
    });
    
    return result;
  }
  
  async getPayablesAgeing(userId: number): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  }> {
    const now = new Date();
    const openPayables = Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.transactionType === "purchase_bill" && 
        ["pending", "overdue", "partially_paid"].includes(transaction.status)
    );
    
    const result = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };
    
    openPayables.forEach(transaction => {
      if (!transaction.dueDate) return;
      
      const dueDate = new Date(transaction.dueDate);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        result.current += Number(transaction.balanceDue || 0);
      } else if (diffDays <= 30) {
        result.days1to30 += Number(transaction.balanceDue || 0);
      } else if (diffDays <= 60) {
        result.days31to60 += Number(transaction.balanceDue || 0);
      } else {
        result.days60plus += Number(transaction.balanceDue || 0);
      }
    });
    
    return result;
  }
  
  // Initialize demo data
  private initializeData() {
    // Create a demo user
    const user: User = {
      id: 1,
      username: "demo",
      password: "password",
      companyName: "Trivedi & Sons",
      gstin: "22AAAAA0000A1Z5",
      email: "demo@example.com",
      phone: "9876543210",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    this.userIdCounter = 2;

    // Create demo parties (customers and vendors)
    const parties: Party[] = [
      {
        id: 1,
        name: "GlobalTech Solutions",
        type: "customer",
        gstin: "27BBBBB1111B1Z5",
        contactPerson: "Sanjay Kumar",
        email: "contact@globaltech.com",
        phone: "9876543211",
        address: "123 Tech Park",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        creditLimit: "500000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Bharath Electronics Ltd",
        type: "vendor",
        gstin: "29CCCCC2222C1Z5",
        contactPerson: "Rajesh Sharma",
        email: "procurement@bel.com",
        phone: "9876543212",
        address: "456 Industrial Area",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        creditLimit: "250000",
        creditPeriod: 45,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        name: "Sundar Innovations",
        type: "customer",
        gstin: "33DDDDD3333D1Z5",
        contactPerson: "Leela Sundar",
        email: "info@sundarinnovations.com",
        phone: "9876543213",
        address: "789 Tech Hub",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        creditLimit: "350000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 4,
        name: "Ashok Suppliers",
        type: "vendor",
        gstin: "32EEEEE4444E1Z5",
        contactPerson: "Ashok Patel",
        email: "sales@ashoksuppliers.com",
        phone: "9876543214",
        address: "101 Market Street",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        creditLimit: "200000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 5,
        name: "Patel Enterprises",
        type: "customer",
        gstin: "24FFFFF5555F1Z5",
        contactPerson: "Harish Patel",
        email: "contact@patelenterprises.com",
        phone: "9876543215",
        address: "222 Business Park",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380001",
        creditLimit: "400000",
        creditPeriod: 45,
        userId: 1,
        createdAt: new Date()
      }
    ];

    parties.forEach(party => this.parties.set(party.id, party));
    this.partyIdCounter = parties.length + 1;

    // Create demo items
    const items: Item[] = [
      {
        id: 1,
        name: "Laptop",
        hsnCode: "8471",
        unit: "Nos",
        category: "Electronics",
        description: "High-performance business laptop",
        sellingPrice: "45000",
        purchasePrice: "38000",
        openingStock: "10",
        minStockLevel: "2",
        userId: 1,
        createdAt: new Date(),
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        imageUrls: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853"],
        isListed: true,
        listingDescription: "Ultra-fast business laptop with high performance and extended battery life.",
        listingCategory: "Electronics",
        listingTags: ["laptop", "business", "high-performance"],
        listingStatus: "active",
        mrp: "48000",
        discountPercentage: "6.25",
        featuredProduct: true,
        brandName: "TechPro",
        specifications: "Intel Core i7, 16GB RAM, 512GB SSD, 15.6 inch FHD display",
        ratings: "4.5",
        reviewCount: 24
      },
      {
        id: 2,
        name: "Desktop Computer",
        hsnCode: "8471",
        unit: "Nos",
        category: "Electronics",
        description: "Office desktop computer",
        sellingPrice: "35000",
        purchasePrice: "30000",
        openingStock: "5",
        minStockLevel: "1",
        userId: 1,
        createdAt: new Date(),
        imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
        imageUrls: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5"],
        isListed: true,
        listingDescription: "Powerful desktop computer for office use.",
        listingCategory: "Electronics",
        listingTags: ["desktop", "office", "computer"],
        listingStatus: "active",
        mrp: "38000",
        discountPercentage: "7.9",
        featuredProduct: false,
        brandName: "CompTech",
        specifications: "Intel Core i5, 8GB RAM, 1TB HDD",
        ratings: "4.2",
        reviewCount: 15
      },
      {
        id: 3,
        name: "Network Switch",
        hsnCode: "8517",
        unit: "Nos",
        category: "Networking",
        description: "24-port gigabit network switch",
        sellingPrice: "8500",
        purchasePrice: "7200",
        openingStock: "8",
        minStockLevel: "2",
        userId: 1,
        createdAt: new Date(),
        imageUrl: "https://images.unsplash.com/photo-1632912193365-95bb8fe822c9",
        imageUrls: ["https://images.unsplash.com/photo-1632912193365-95bb8fe822c9"],
        isListed: true,
        listingDescription: "Enterprise-grade 24-port network switch.",
        listingCategory: "Networking",
        listingTags: ["network", "switch", "ethernet"],
        listingStatus: "active",
        mrp: "9000",
        discountPercentage: "5.5",
        featuredProduct: false,
        brandName: "NetLink",
        specifications: "24 Gigabit ports, managed switch",
        ratings: "4.7",
        reviewCount: 8
      }
    ];

    items.forEach(item => this.items.set(item.id, item));
    this.itemIdCounter = items.length + 1;

    // Create demo transactions
    const currentDate = new Date();

    const transactions: Transaction[] = [
      {
        id: 1,
        transactionNumber: "INV-2023-042",
        transactionType: "sales_invoice",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 2)),
        partyId: 1,
        amount: "42500",
        balanceDue: "42500",
        dueDate: new Date(currentDate.setDate(currentDate.getDate() + 30)),
        status: "pending",
        notes: "Sale of laptops and accessories",
        reference: "PO-GT-2023-125",
        isBnpl: false,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        transactionNumber: "BILL-2023-128",
        transactionType: "purchase_bill",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 3)),
        partyId: 2,
        amount: "18750",
        balanceDue: "18750",
        dueDate: new Date(currentDate.setDate(currentDate.getDate() + 45)),
        status: "using_bnpl",
        notes: "Purchase of electronics components",
        reference: "PO-TS-2023-087",
        isBnpl: true,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        transactionNumber: "RCPT-2023-054",
        transactionType: "receipt",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 5)),
        partyId: 3,
        amount: "28600",
        balanceDue: "0",
        dueDate: null,
        status: "completed",
        notes: "Receipt against invoice INV-2023-039",
        reference: "INV-2023-039",
        isBnpl: false,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      }
    ];

    transactions.forEach(transaction => this.transactions.set(transaction.id, transaction));
    this.transactionIdCounter = transactions.length + 1;

    // Create demo transaction items
    const transactionItems: TransactionItem[] = [
      {
        id: 1,
        transactionId: 1,
        itemId: 1,
        description: "Laptop",
        quantity: "1",
        rate: "45000",
        amount: "45000",
        taxRate: "5",
        taxAmount: "2250",
        totalAmount: "47250",
        createdAt: new Date()
      },
      {
        id: 2,
        transactionId: 2,
        itemId: 2,
        description: "Desktop Computer",
        quantity: "1",
        rate: "35000",
        amount: "35000",
        taxRate: "5",
        taxAmount: "1750",
        totalAmount: "36750",
        createdAt: new Date()
      }
    ];

    transactionItems.forEach(item => this.transactionItems.set(item.id, item));
    this.transactionItemIdCounter = transactionItems.length + 1;

    // Create demo BNPL limits
    const bnplLimits: BnplLimit[] = [
      {
        id: 1,
        partyId: 2,
        limitType: "purchase",
        totalLimit: "250000",
        usedLimit: "150000",
        expiryDate: new Date(currentDate.setMonth(currentDate.getMonth() + 6)),
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        partyId: 1,
        limitType: "sales",
        totalLimit: "350000",
        usedLimit: "225000",
        expiryDate: new Date(currentDate.setMonth(currentDate.getMonth() + 6)),
        userId: 1,
        createdAt: new Date()
      }
    ];

    bnplLimits.forEach(limit => this.bnplLimits.set(limit.id, limit));
    this.bnplLimitIdCounter = bnplLimits.length + 1;

    // Create demo tally sync logs
    const tallySyncLogs: TallySyncLog[] = [
      {
        id: 1,
        syncType: "pull",
        syncStatus: "success",
        transactionCount: 15,
        details: "Successfully synced 15 transactions",
        userId: 1,
        syncedAt: new Date(currentDate.setDate(currentDate.getDate() - 1))
      },
      {
        id: 2,
        syncType: "push",
        syncStatus: "success",
        transactionCount: 8,
        details: "Successfully pushed 8 transactions to Tally",        userId: 1,
        syncedAt: new Date(currentDate.setDate(currentDate.getDate() - 2))
      }
    ];

    tallySyncLogs.forEach(log => this.tallySyncLogs.set(log.id, log));
    this.tallySyncLogIdCounter = tallySyncLogs.length + 1;
  }

  // CRUD operations for Item
  async createItem(item: InsertItem): Promise<Item> {
    const newItem: Item = {
      id: this.itemIdCounter++,
      ...item,
      createdAt: new Date()
    };
    this.items.set(newItem.id, newItem);
    return newItem;
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item> {
    const existingItem = this.items.get(id);
    if (!existingItem) {
      throw new Error('Item not found');
    }
    const updatedItem = { ...existingItem, ...item };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  // CRUD operations for Transaction
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.transactionIdCounter++,
      ...transaction,
      createdAt: new Date()
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Get all items for a user
  async getItemsByUserId(userId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => item.userId === userId);
  }

  // Get all transactions for a user
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.userId === userId);
  }

  // Get transaction items for a transaction
  async getTransactionItemsByTransactionId(transactionId: number): Promise<TransactionItem[]> {
    return Array.from(this.transactionItems.values())
      .filter(item => item.transactionId === transactionId);
  }

  // Get aging analysis
  async getAgingAnalysis(userId: number): Promise<any> {
    const result = {
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };

    const transactions = await this.getTransactionsByUserId(userId);
    const today = new Date();

    transactions.forEach(transaction => {
      if (!transaction.dueDate || !transaction.balanceDue) return;

      const dueDate = new Date(transaction.dueDate);
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        result.days1to30 += Number(transaction.balanceDue || 0);
      } else if (diffDays <= 60) {
        result.days31to60 += Number(transaction.balanceDue || 0);
      } else {
        result.days60plus += Number(transaction.balanceDue || 0);
      }
    });

    return result;
  }

  // Initialize demo data
  private initializeData() {
    // Create a demo user
    const user: User = {
      id: 1,
      username: "demo",
      password: "password",
      companyName: "Trivedi & Sons",
      gstin: "22AAAAA0000A1Z5",
      email: "demo@example.com",
      phone: "9876543210",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    this.userIdCounter = 2;

    // Create demo parties (customers and vendors)
    const parties: Party[] = [
      {
        id: 1,
        name: "GlobalTech Solutions",
        type: "customer",
        gstin: "27BBBBB1111B1Z5",
        contactPerson: "Sanjay Kumar",
        email: "contact@globaltech.com",
        phone: "9876543211",
        address: "123 Tech Park",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        creditLimit: "500000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Bharath Electronics Ltd",
        type: "vendor",
        gstin: "29CCCCC2222C1Z5",
        contactPerson: "Rajesh Sharma",
        email: "procurement@bel.com",
        phone: "9876543212",
        address: "456 Industrial Area",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        creditLimit: "250000",
        creditPeriod: 45,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        name: "Sundar Innovations",
        type: "customer",
        gstin: "33DDDDD3333D1Z5",
        contactPerson: "Leela Sundar",
        email: "info@sundarinnovations.com",
        phone: "9876543213",
        address: "789 Tech Hub",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        creditLimit: "350000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 4,
        name: "Ashok Suppliers",
        type: "vendor",
        gstin: "32EEEEE4444E1Z5",
        contactPerson: "Ashok Patel",
        email: "sales@ashoksuppliers.com",
        phone: "9876543214",
        address: "101 Market Street",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        creditLimit: "200000",
        creditPeriod: 30,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 5,
        name: "Patel Enterprises",
        type: "customer",
        gstin: "24FFFFF5555F1Z5",
        contactPerson: "Harish Patel",
        email: "contact@patelenterprises.com",
        phone: "9876543215",
        address: "222 Business Park",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380001",
        creditLimit: "400000",
        creditPeriod: 45,
        userId: 1,
        createdAt: new Date()
      }
    ];

    parties.forEach(party => this.parties.set(party.id, party));
    this.partyIdCounter = parties.length + 1;

    // Create demo items
    const items: Item[] = [
      {
        id: 1,
        name: "Laptop",
        hsnCode: "8471",
        unit: "Nos",
        category: "Electronics",
        description: "High-performance business laptop",
        sellingPrice: "45000",
        purchasePrice: "38000",
        openingStock: "10",
        minStockLevel: "2",
        userId: 1,
        createdAt: new Date(),
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        imageUrls: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853"],
        isListed: true,
        listingDescription: "Ultra-fast business laptop with high performance and extended battery life.",
        listingCategory: "Electronics",
        listingTags: ["laptop", "business", "high-performance"],
        listingStatus: "active",
        mrp: "48000",
        discountPercentage: "6.25",
        featuredProduct: true,
        brandName: "TechPro",
        specifications: "Intel Core i7, 16GB RAM, 512GB SSD, 15.6 inch FHD display",
        ratings: "4.5",
        reviewCount: 24
      },
      {
        id: 2,
        name: "Desktop Computer",
        hsnCode: "8471",
        unit: "Nos",
        category: "Electronics",
        description: "Office desktop computer",
        sellingPrice: "35000",
        purchasePrice: "30000",
        openingStock: "5",
        minStockLevel: "1",
        userId: 1,
        createdAt: new Date(),
        imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
        imageUrls: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5"],
        isListed: true,
        listingDescription: "Powerful desktop computer for office use.",
        listingCategory: "Electronics",
        listingTags: ["desktop", "office", "computer"],
        listingStatus: "active",
        mrp: "38000",
        discountPercentage: "7.9",
        featuredProduct: false,
        brandName: "CompTech",
        specifications: "Intel Core i5, 8GB RAM, 1TB HDD",
        ratings: "4.2",
        reviewCount: 15
      },
      {
        id: 3,
        name: "Network Switch",
        hsnCode: "8517",
        unit: "Nos",
        category: "Networking",
        description: "24-port gigabit network switch",
        sellingPrice: "8500",
        purchasePrice: "7200",
        openingStock: "8",
        minStockLevel: "2",
        userId: 1,
        createdAt: new Date(),
        imageUrl: "https://images.unsplash.com/photo-1632912193365-95bb8fe822c9",
        imageUrls: ["https://images.unsplash.com/photo-1632912193365-95bb8fe822c9"],
        isListed: true,
        listingDescription: "Enterprise-grade 24-port network switch.",
        listingCategory: "Networking",
        listingTags: ["network", "switch", "ethernet"],
        listingStatus: "active",
        mrp: "9000",
        discountPercentage: "5.5",
        featuredProduct: false,
        brandName: "NetLink",
        specifications: "24 Gigabit ports, managed switch",
        ratings: "4.7",
        reviewCount: 8
      }
    ];

    items.forEach(item => this.items.set(item.id, item));
    this.itemIdCounter = items.length + 1;

    // Create demo transactions
    const currentDate = new Date();

    const transactions: Transaction[] = [
      {
        id: 1,
        transactionNumber: "INV-2023-042",
        transactionType: "sales_invoice",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 2)),
        partyId: 1,
        amount: "42500",
        balanceDue: "42500",
        dueDate: new Date(currentDate.setDate(currentDate.getDate() + 30)),
        status: "pending",
        notes: "Sale of laptops and accessories",
        reference: "PO-GT-2023-125",
        isBnpl: false,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        transactionNumber: "BILL-2023-128",
        transactionType: "purchase_bill",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 3)),
        partyId: 2,
        amount: "18750",
        balanceDue: "18750",
        dueDate: new Date(currentDate.setDate(currentDate.getDate() + 45)),
        status: "using_bnpl",
        notes: "Purchase of electronics components",
        reference: "PO-TS-2023-087",
        isBnpl: true,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        transactionNumber: "RCPT-2023-054",
        transactionType: "receipt",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 5)),
        partyId: 3,
        amount: "28600",
        balanceDue: "0",
        dueDate: null,
        status: "completed",
        notes: "Receipt against invoice INV-2023-039",
        reference: "INV-2023-039",
        isBnpl: false,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      }
    ];

    transactions.forEach(transaction => this.transactions.set(transaction.id, transaction));
    this.transactionIdCounter = transactions.length + 1;

    // Create demo transaction items
    const transactionItems: TransactionItem[] = [
      {
        id: 1,
        transactionId: 1,
        itemId: 1,
        description: "Laptop",
        quantity: "1",
        rate: "45000",
        amount: "45000",
        taxRate: "5",
        taxAmount: "2250",
        totalAmount: "47250",
        createdAt: new Date()
      },
      {
        id: 2,
        transactionId: 2,
        itemId: 2,
        description: "Desktop Computer",
        quantity: "1",
        rate: "35000",
        amount: "35000",
        taxRate: "5",
        taxAmount: "1750",
        totalAmount: "36750",
        createdAt: new Date()
      }
    ];

    transactionItems.forEach(item => this.transactionItems.set(item.id, item));
    this.transactionItemIdCounter = transactionItems.length + 1;

    // Create demo BNPL limits
    const bnplLimits: BnplLimit[] = [
      {
        id: 1,
        partyId: 2,
        limitType: "purchase",
        totalLimit: "250000",
        usedLimit: "150000",
        expiryDate: new Date(currentDate.setMonth(currentDate.getMonth() + 6)),
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        partyId: 1,
        limitType: "sales",
        totalLimit: "350000",
        usedLimit: "225000",
        expiryDate: new Date(currentDate.setMonth(currentDate.getMonth() + 6)),
        userId: 1,
        createdAt: new Date()
      }
    ];

    bnplLimits.forEach(limit => this.bnplLimits.set(limit.id, limit));
    this.bnplLimitIdCounter = bnplLimits.length + 1;

    // Create demo tally sync logs
    const tallySyncLogs: TallySyncLog[] = [
      {
        id: 1,
        syncType: "pull",
        syncStatus: "success",
        transactionCount: 15,
        details: "Successfully synced 15 transactions",
        userId: 1,
        syncedAt: new Date(currentDate.setDate(currentDate.getDate() - 1))
      },
      {
        id: 2,
        syncType: "push",
        syncStatus: "success",
        transactionCount: 8,
        details: "Successfully pushed 8 transactions to Tally",
        userId: 1,
        syncedAt: new Date(currentDate.setDate(currentDate.getDate() - 2))
      }
    ];

    tallySyncLogs.forEach(log => this.tallySyncLogs.set(log.id, log));
    this.tallySyncLogIdCounter = tallySyncLogs.length + 1;
  }
}

export const storage = new MemStorage();

// export const storage = new DatabaseStorage();