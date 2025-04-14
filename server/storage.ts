import { 
  User, InsertUser, users,
  Party, InsertParty, parties,
  Item, InsertItem, items,
  Transaction, InsertTransaction, transactions,
  TransactionItem, InsertTransactionItem, transactionItems,
  BnplLimit, InsertBnplLimit, bnplLimits,
  TallySyncLog, InsertTallySyncLog, tallySyncLogs
} from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parties: Map<number, Party>;
  private items: Map<number, Item>;
  private transactions: Map<number, Transaction>;
  private transactionItems: Map<number, TransactionItem>;
  private bnplLimits: Map<number, BnplLimit>;
  private tallySyncLogs: Map<number, TallySyncLog>;
  
  private userIdCounter: number;
  private partyIdCounter: number;
  private itemIdCounter: number;
  private transactionIdCounter: number;
  private transactionItemIdCounter: number;
  private bnplLimitIdCounter: number;
  private tallySyncLogIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.parties = new Map();
    this.items = new Map();
    this.transactions = new Map();
    this.transactionItems = new Map();
    this.bnplLimits = new Map();
    this.tallySyncLogs = new Map();
    
    this.userIdCounter = 1;
    this.partyIdCounter = 1;
    this.itemIdCounter = 1;
    this.transactionIdCounter = 1;
    this.transactionItemIdCounter = 1;
    this.bnplLimitIdCounter = 1;
    this.tallySyncLogIdCounter = 1;
    
    // Initialize with demo data
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
    
    // Create some demo parties
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
    
    // Create some demo items
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
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
        imageUrls: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80"],
        isListed: true,
        listingDescription: "Ultra-fast business laptop with high performance and extended battery life. Perfect for professionals.",
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
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
        imageUrls: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80"],
        isListed: true,
        listingDescription: "Powerful desktop computer suitable for office use, graphic design, and moderate gaming needs.",
        listingCategory: "Electronics",
        listingTags: ["desktop", "office", "computer"],
        listingStatus: "active",
        mrp: "38000",
        discountPercentage: "7.9",
        featuredProduct: false,
        brandName: "CompTech",
        specifications: "Intel Core i5, 8GB RAM, 1TB HDD, 23-inch monitor, keyboard and mouse",
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
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1632912193365-95bb8fe822c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
        imageUrls: ["https://images.unsplash.com/photo-1632912193365-95bb8fe822c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80"],
        isListed: true,
        listingDescription: "Enterprise-grade 24-port gigabit network switch for reliable and high-speed networking.",
        listingCategory: "Networking",
        listingTags: ["network", "switch", "gigabit", "ethernet"],
        listingStatus: "active",
        mrp: "9000",
        discountPercentage: "5.5",
        featuredProduct: false,
        brandName: "NetLink",
        specifications: "24 Gigabit Ethernet ports, managed switch, rack-mountable, energy efficient",
        ratings: "4.7",
        reviewCount: 8
      },
      {
        id: 4,
        name: "Printer",
        hsnCode: "8443",
        unit: "Nos",
        category: "Electronics",
        description: "Color laser printer",
        sellingPrice: "12000",
        purchasePrice: "9800",
        openingStock: "3",
        minStockLevel: "1",
        userId: 1,
        createdAt: new Date(),
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
        imageUrls: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80"],
        isListed: true,
        listingDescription: "Versatile color laser printer for professional documents and high-quality color prints.",
        listingCategory: "Electronics",
        listingTags: ["printer", "laser", "color", "office"],
        listingStatus: "active",
        mrp: "13500",
        discountPercentage: "11.1",
        featuredProduct: true,
        brandName: "PrintTech",
        specifications: "Color laser, duplex printing, wireless connectivity, 22 ppm, 250-sheet capacity",
        ratings: "4.4",
        reviewCount: 19
      },
      {
        id: 5,
        name: "UPS Battery",
        hsnCode: "8507",
        unit: "Nos",
        category: "Electronics",
        description: "1500VA UPS battery",
        sellingPrice: "3500",
        purchasePrice: "2800",
        openingStock: "12",
        minStockLevel: "3",
        userId: 1,
        createdAt: new Date(),
        // E-commerce fields
        imageUrl: "https://images.unsplash.com/photo-1583215770686-39231951a9d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
        imageUrls: ["https://images.unsplash.com/photo-1583215770686-39231951a9d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80"],
        isListed: false,
        listingDescription: "Reliable 1500VA UPS battery with surge protection and backup for critical equipment.",
        listingCategory: "Electronics",
        listingTags: ["ups", "battery", "power backup"],
        listingStatus: "inactive",
        mrp: "4000",
        discountPercentage: "12.5",
        featuredProduct: false,
        brandName: "PowerSure",
        specifications: "1500VA capacity, 6 outlets, AVR, surge protection, 20-minute runtime at full load",
        ratings: "4.1",
        reviewCount: 12
      }
    ];
    
    items.forEach(item => this.items.set(item.id, item));
    this.itemIdCounter = items.length + 1;
    
    // Create some demo transactions
    const currentDate = new Date();
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const transactions: Transaction[] = [
      {
        id: 1,
        transactionNumber: "INV-2023-042",
        transactionType: "sales_invoice",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 2)),
        partyId: 1, // GlobalTech Solutions
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
        partyId: 2, // Bharath Electronics
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
        partyId: 3, // Sundar Innovations
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
      },
      {
        id: 4,
        transactionNumber: "PAY-2023-087",
        transactionType: "payment",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 8)),
        partyId: 4, // Ashok Suppliers
        amount: "32450",
        balanceDue: "0",
        dueDate: null,
        status: "completed",
        notes: "Payment against bill BILL-2023-124",
        reference: "BILL-2023-124",
        isBnpl: false,
        isSync: true,
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 5,
        transactionNumber: "INV-2023-041",
        transactionType: "sales_invoice",
        transactionDate: new Date(currentDate.setDate(currentDate.getDate() - 10)),
        partyId: 5, // Patel Enterprises
        amount: "55840",
        balanceDue: "0",
        dueDate: new Date(currentDate.setDate(currentDate.getDate() + 45)),
        status: "paid",
        notes: "Sale of networking equipment",
        reference: "PO-PE-2023-112",
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
        itemId: 5,
        description: "UPS Battery",
        quantity: "5",
        rate: "2800",
        amount: "14000",
        taxRate: "18",
        taxAmount: "2520",
        totalAmount: "16520",
        createdAt: new Date()
      },
      {
        id: 3,
        transactionId: 5,
        itemId: 3,
        description: "Network Switch",
        quantity: "6",
        rate: "8500",
        amount: "51000",
        taxRate: "12",
        taxAmount: "6120",
        totalAmount: "57120",
        createdAt: new Date()
      }
    ];
    
    transactionItems.forEach(item => this.transactionItems.set(item.id, item));
    this.transactionItemIdCounter = transactionItems.length + 1;
    
    // Create demo BNPL limits
    const bnplLimits: BnplLimit[] = [
      {
        id: 1,
        partyId: 2, // Bharath Electronics (vendor)
        limitType: "purchase",
        totalLimit: "250000",
        usedLimit: "150000",
        expiryDate: new Date(currentDate.setMonth(currentDate.getMonth() + 6)),
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        partyId: 1, // GlobalTech Solutions (customer)
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
        transactionCount: 42,
        details: "Successfully pulled 42 transactions from Tally",
        userId: 1,
        syncedAt: new Date(currentDate.setHours(currentDate.getHours() - 6))
      },
      {
        id: 2,
        syncType: "push",
        syncStatus: "success",
        transactionCount: 15,
        details: "Successfully pushed 15 transactions to Tally",
        userId: 1,
        syncedAt: new Date(currentDate.setDate(currentDate.getDate() - 1))
      }
    ];
    
    tallySyncLogs.forEach(log => this.tallySyncLogs.set(log.id, log));
    this.tallySyncLogIdCounter = tallySyncLogs.length + 1;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Party operations
  async getParty(id: number): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party;
  }
  
  async getPartiesByUserId(userId: number): Promise<Party[]> {
    return db.select().from(parties).where(eq(parties.userId, userId));
  }
  
  async getPartiesByType(userId: number, type: string): Promise<Party[]> {
    return db.select().from(parties).where(
      and(
        eq(parties.userId, userId),
        eq(parties.type, type)
      )
    );
  }
  
  async createParty(party: InsertParty): Promise<Party> {
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }
  
  async updateParty(id: number, updates: Partial<InsertParty>): Promise<Party> {
    const [updatedParty] = await db.update(parties)
      .set(updates)
      .where(eq(parties.id, id))
      .returning();
    
    if (!updatedParty) {
      throw new Error(`Party with id ${id} not found`);
    }
    
    return updatedParty;
  }
  
  // Item operations
  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }
  
  async getItemsByUserId(userId: number): Promise<Item[]> {
    return db.select().from(items).where(eq(items.userId, userId));
  }
  
  async getItemsWithListings(userId: number): Promise<Item[]> {
    return db.select().from(items).where(
      and(
        eq(items.userId, userId),
        eq(items.isListed, true)
      )
    );
  }
  
  async getFeatureProducts(limit: number = 10): Promise<Item[]> {
    return db.select()
      .from(items)
      .where(
        and(
          eq(items.isListed, true),
          eq(items.featuredProduct, true)
        )
      )
      .limit(limit);
  }
  
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }
  
  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item> {
    const [updatedItem] = await db.update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    return updatedItem;
  }
  
  async updateItemListing(id: number, listingData: Partial<InsertItem>): Promise<Item> {
    // Only update specific fields related to listings
    const listingUpdates: Partial<InsertItem> = {};
    
    if (listingData.imageUrl !== undefined) listingUpdates.imageUrl = listingData.imageUrl;
    if (listingData.imageUrls !== undefined) listingUpdates.imageUrls = listingData.imageUrls;
    if (listingData.isListed !== undefined) listingUpdates.isListed = listingData.isListed;
    if (listingData.listingDescription !== undefined) listingUpdates.listingDescription = listingData.listingDescription;
    if (listingData.listingCategory !== undefined) listingUpdates.listingCategory = listingData.listingCategory;
    if (listingData.listingTags !== undefined) listingUpdates.listingTags = listingData.listingTags;
    if (listingData.listingStatus !== undefined) listingUpdates.listingStatus = listingData.listingStatus;
    if (listingData.mrp !== undefined) listingUpdates.mrp = listingData.mrp;
    if (listingData.discountPercentage !== undefined) listingUpdates.discountPercentage = listingData.discountPercentage;
    if (listingData.featuredProduct !== undefined) listingUpdates.featuredProduct = listingData.featuredProduct;
    if (listingData.brandName !== undefined) listingUpdates.brandName = listingData.brandName;
    if (listingData.specifications !== undefined) listingUpdates.specifications = listingData.specifications;
    if (listingData.ratings !== undefined) listingUpdates.ratings = listingData.ratings;
    if (listingData.reviewCount !== undefined) listingUpdates.reviewCount = listingData.reviewCount;
    
    const [updatedItem] = await db.update(items)
      .set(listingUpdates)
      .where(eq(items.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    return updatedItem;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  }
  
  async getTransactionsByType(userId: number, type: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionType, type)
      )
    );
  }
  
  async getTransactionsByPartyId(userId: number, partyId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.partyId, partyId)
      )
    );
  }
  
  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit);
  }
  
  async getOpenPayables(userId: number): Promise<{ total: number, count: number }> {
    const openPayables = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, "purchase_bill"),
          sql`${transactions.status} IN ('pending', 'overdue', 'partially_paid')`
        )
      );
    
    const total = openPayables.reduce(
      (sum, transaction) => sum + Number(transaction.balanceDue || 0), 
      0
    );
    
    return { total, count: openPayables.length };
  }
  
  async getOpenReceivables(userId: number): Promise<{ total: number, count: number }> {
    const openReceivables = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, "sales_invoice"),
          sql`${transactions.status} IN ('pending', 'overdue', 'partially_paid')`
        )
      );
    
    const total = openReceivables.reduce(
      (sum, transaction) => sum + Number(transaction.balanceDue || 0), 
      0
    );
    
    return { total, count: openReceivables.length };
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
  
  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    return updatedTransaction;
  }
  
  // Transaction Item operations
  async getTransactionItemsByTransactionId(transactionId: number): Promise<TransactionItem[]> {
    return db.select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));
  }
  
  async createTransactionItem(transactionItem: InsertTransactionItem): Promise<TransactionItem> {
    const [newTransactionItem] = await db.insert(transactionItems).values(transactionItem).returning();
    return newTransactionItem;
  }
  
  // BNPL Limit operations
  async getBnplLimitsByPartyId(partyId: number): Promise<BnplLimit[]> {
    return db.select().from(bnplLimits).where(eq(bnplLimits.partyId, partyId));
  }
  
  async getBnplLimitsByUserId(userId: number): Promise<BnplLimit[]> {
    return db.select().from(bnplLimits).where(eq(bnplLimits.userId, userId));
  }
  
  async getBnplLimitsByType(userId: number, type: string): Promise<BnplLimit[]> {
    return db.select().from(bnplLimits).where(
      and(
        eq(bnplLimits.userId, userId),
        eq(bnplLimits.limitType, type)
      )
    );
  }
  
  async createBnplLimit(bnplLimit: InsertBnplLimit): Promise<BnplLimit> {
    const [newBnplLimit] = await db.insert(bnplLimits).values(bnplLimit).returning();
    return newBnplLimit;
  }
  
  async updateBnplLimit(id: number, updates: Partial<InsertBnplLimit>): Promise<BnplLimit> {
    const [updatedBnplLimit] = await db.update(bnplLimits)
      .set(updates)
      .where(eq(bnplLimits.id, id))
      .returning();
    
    if (!updatedBnplLimit) {
      throw new Error(`BNPL Limit with id ${id} not found`);
    }
    
    return updatedBnplLimit;
  }
  
  // Tally Sync operations
  async getTallySyncLogs(userId: number): Promise<TallySyncLog[]> {
    return db.select()
      .from(tallySyncLogs)
      .where(eq(tallySyncLogs.userId, userId))
      .orderBy(desc(tallySyncLogs.syncedAt));
  }
  
  async getRecentTallySyncLog(userId: number): Promise<TallySyncLog | undefined> {
    const [recentLog] = await db.select()
      .from(tallySyncLogs)
      .where(eq(tallySyncLogs.userId, userId))
      .orderBy(desc(tallySyncLogs.syncedAt))
      .limit(1);
    
    return recentLog;
  }
  
  async createTallySyncLog(tallySyncLog: InsertTallySyncLog): Promise<TallySyncLog> {
    const [newTallySyncLog] = await db.insert(tallySyncLogs).values(tallySyncLog).returning();
    return newTallySyncLog;
  }
  
  // Ageing Analysis
  async getReceivablesAgeing(userId: number): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  }> {
    const now = new Date();
    
    // Get all open receivables
    const openReceivables = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionType, "sales_invoice"),
        sql`${transactions.status} IN ('pending', 'overdue', 'partially_paid')`
      )
    );
    
    const result = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };
    
    // Calculate the aging brackets
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
    
    // Get all open payables
    const openPayables = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionType, "purchase_bill"),
        sql`${transactions.status} IN ('pending', 'overdue', 'partially_paid')`
      )
    );
    
    const result = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    };
    
    // Calculate the aging brackets
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
}

// Comment out MemStorage for now and use DatabaseStorage
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
