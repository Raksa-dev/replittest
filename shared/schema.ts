import { pgTable, text, serial, integer, boolean, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", [
  // Sales transaction types
  "sales_invoice", 
  "debit_note", 
  "receipt", 
  "sales_order", 
  "quotation",
  "quotation_request", 
  "estimate",
  "delivery_note",
  
  // Purchase transaction types
  "purchase_bill", 
  "purchase_order", 
  "purchase_quotation_request",
  "purchase_quotation",
  "credit_note", 
  "payment",
  "grn"  // Goods Receipt Note
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  // Common statuses
  "draft", 
  "pending", 
  "approved", 
  "completed", 
  "rejected", 
  "overdue", 
  "partially_paid", 
  "paid",
  "cancelled",
  "using_bnpl",
  "open",
  "closed", 
  
  // Sales specific statuses
  "responded",
  "sent",
  "order_placed",
  "packing",
  "shipped",
  "delivered",
  "billed",
  "partially_billed",
  
  // Purchase specific statuses
  "received", 
  "accepted",
  "partially_received",
  "vendor_accepted",
  "vendor_rejected",
  "goods_received",
  "invoice_received", 
  "refund_received",
  "partially_adjusted",
  "fully_adjusted",
  "in_transit"
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  gstin: text("gstin"),
  email: text("email"),
  phone: text("phone"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for users
export const usersRelations = relations(users, ({ many }) => ({
  parties: many(parties),
  items: many(items),
  transactions: many(transactions),
  bnplLimits: many(bnplLimits),
  tallySyncLogs: many(tallySyncLogs),
}));

// Customers/Vendors table
export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // customer, vendor, or both
  gstin: text("gstin"),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  creditPeriod: integer("credit_period").default(0), // in days
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for parties
export const partiesRelations = relations(parties, ({ one, many }) => ({
  user: one(users, {
    fields: [parties.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  bnplLimits: many(bnplLimits),
}));

// Products/Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hsnCode: text("hsn_code"),
  unit: text("unit"),
  category: text("category"),
  description: text("description"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  openingStock: decimal("opening_stock", { precision: 10, scale: 2 }).default("0"),
  minStockLevel: decimal("min_stock_level", { precision: 10, scale: 2 }).default("0"),
  
  // E-commerce specific fields
  imageUrl: text("image_url"),
  imageUrls: text("image_urls").array(),
  isListed: boolean("is_listed").default(false),
  listingDescription: text("listing_description"),
  listingCategory: text("listing_category"),
  listingTags: text("listing_tags").array(),
  listingStatus: text("listing_status").default("inactive"), // active, inactive, pending, rejected
  mrp: decimal("mrp", { precision: 10, scale: 2 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  featuredProduct: boolean("featured_product").default(false),
  brandName: text("brand_name"),
  specifications: text("specifications"),
  ratings: decimal("ratings", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for items
export const itemsRelations = relations(items, ({ one, many }) => ({
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  transactionItems: many(transactionItems),
}));

// Transactions table (for sales, purchases, payments, receipts)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionNumber: text("transaction_number").notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  partyId: integer("party_id").references(() => parties.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }),
  dueDate: timestamp("due_date"),
  status: transactionStatusEnum("status").default("draft"),
  notes: text("notes"),
  reference: text("reference"),
  isBnpl: boolean("is_bnpl").default(false),
  isSync: boolean("is_sync").default(false), // Is synced with Tally
  invoiceStatus: text("invoice_status"), // Received, Sent for acceptance, Accepted, Open, Billed, Paid, Partially billed, Partially paid
  inventoryStatus: text("inventory_status"), // Packing, shipped, Delivered, cancelled, closed
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  paymentTerms: text("payment_terms"),
  creditTerms: text("credit_terms"),
  termsAndConditions: text("terms_and_conditions"),
  
  // Purchase-specific fields
  linkedTransactionId: integer("linked_transaction_id"), // For linking GRN to PO, bills to PO, etc.
  grnNumber: text("grn_number"), // Goods Receipt Note number
  grnDate: timestamp("grn_date"), // GRN date
  vendorBillNumber: text("vendor_bill_number"), // Original bill number from vendor
  vendorInvoiceDate: timestamp("vendor_invoice_date"), // Original invoice date from vendor
  paymentMode: text("payment_mode"), // Cash, Bank Transfer, UPI, etc.
  bankAccount: text("bank_account"), // Bank account details for payment
  tdsCategory: text("tds_category"), // TDS category for purchase payments
  tdsPercentage: decimal("tds_percentage", { precision: 5, scale: 2 }),
  
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for transactions
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  party: one(parties, {
    fields: [transactions.partyId],
    references: [parties.id],
  }),
  transactionItems: many(transactionItems),
  linkedTransaction: one(transactions, {
    fields: [transactions.linkedTransactionId],
    references: [transactions.id],
  }),
}));

// Transaction Items (line items for invoices, bills, orders)
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  itemId: integer("item_id").references(() => items.id),
  description: text("description"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for transaction items
export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  item: one(items, {
    fields: [transactionItems.itemId],
    references: [items.id],
  }),
}));

// BNPL Limits
export const bnplLimits = pgTable("bnpl_limits", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => parties.id),
  limitType: text("limit_type").notNull(), // purchase, sales
  totalLimit: decimal("total_limit", { precision: 10, scale: 2 }).notNull(),
  usedLimit: decimal("used_limit", { precision: 10, scale: 2 }).default("0"),
  expiryDate: timestamp("expiry_date"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for BNPL limits
export const bnplLimitsRelations = relations(bnplLimits, ({ one }) => ({
  user: one(users, {
    fields: [bnplLimits.userId],
    references: [users.id],
  }),
  party: one(parties, {
    fields: [bnplLimits.partyId],
    references: [parties.id],
  }),
}));

// Tally Sync Log
export const tallySyncLogs = pgTable("tally_sync_logs", {
  id: serial("id").primaryKey(),
  syncType: text("sync_type").notNull(), // push, pull
  syncStatus: text("sync_status").notNull(), // success, failed
  transactionCount: integer("transaction_count"),
  details: text("details"),
  userId: integer("user_id").notNull().references(() => users.id),
  syncedAt: timestamp("synced_at").defaultNow(),
});

// Define relations for Tally sync logs
export const tallySyncLogsRelations = relations(tallySyncLogs, ({ one }) => ({
  user: one(users, {
    fields: [tallySyncLogs.userId],
    references: [users.id],
  }),
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPartySchema = createInsertSchema(parties).omit({ id: true, createdAt: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });

// Custom transaction schema with date field handling
export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, createdAt: true })
  .extend({
    transactionDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    expectedDeliveryDate: z.coerce.date().optional().nullable(),
    grnDate: z.coerce.date().optional().nullable(),
    vendorInvoiceDate: z.coerce.date().optional().nullable()
  });

export const insertTransactionItemSchema = createInsertSchema(transactionItems).omit({ id: true, createdAt: true });

// Custom BNPL limit schema with date field handling
export const insertBnplLimitSchema = createInsertSchema(bnplLimits)
  .omit({ id: true, createdAt: true })
  .extend({
    expiryDate: z.coerce.date().optional().nullable()
  });

export const insertTallySyncLogSchema = createInsertSchema(tallySyncLogs).omit({ id: true, syncedAt: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Party = typeof parties.$inferSelect;
export type InsertParty = z.infer<typeof insertPartySchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;

export type BnplLimit = typeof bnplLimits.$inferSelect;
export type InsertBnplLimit = z.infer<typeof insertBnplLimitSchema>;

export type TallySyncLog = typeof tallySyncLogs.$inferSelect;
export type InsertTallySyncLog = z.infer<typeof insertTallySyncLogSchema>;
