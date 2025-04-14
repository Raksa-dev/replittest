import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Format in Indian currency style (e.g., ₹1,23,456.78)
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    // Amber/Yellow Statuses - In progress
    case "pending":
    case "packing":
    case "shipped":
    case "order_placed":
    case "in_transit":
      return "yellow";
      
    // Green Statuses - Completed positive
    case "completed":
    case "paid":
    case "approved":
    case "delivered":
    case "accepted":
    case "goods_received":
    case "vendor_accepted":
    case "fully_adjusted":
      return "green";
      
    // Red Statuses - Negative outcomes
    case "overdue":
    case "cancelled":
    case "rejected":
    case "vendor_rejected":
      return "red";
      
    // Purple Statuses - Special financing
    case "using_bnpl":
      return "purple";
      
    // Gray Statuses - Neutral/informational
    case "draft":
    case "closed":
      return "gray";
      
    // Blue Statuses - Partial completion
    case "partially_paid":
    case "partially_billed":
    case "partially_received":
    case "partially_adjusted":
      return "blue";
      
    // Emerald Statuses - Active engagement
    case "open":
    case "responded":
    case "received":
      return "emerald";
      
    // Sky Blue Statuses - Processed but waiting
    case "sent":
    case "billed":
    case "invoice_received":
    case "refund_received":
      return "sky";
      
    default:
      return "gray";
  }
}

export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    // Sales transactions
    case "sales_invoice":
      return "Sales Invoice";
    case "receipt":
      return "Receipt";
    case "debit_note":
      return "Debit Note";
    case "sales_order":
      return "Sales Order";
    case "quotation":
      return "Quotation";
    case "quotation_request":
      return "Quotation Request";
    case "estimate":
      return "Estimate";
    case "delivery_note":
      return "Delivery Note";
      
    // Purchase transactions
    case "purchase_bill":
      return "Purchase Bill";
    case "payment":
      return "Payment";
    case "credit_note":
      return "Credit Note";
    case "purchase_order":
      return "Purchase Order";
    case "purchase_quotation":
      return "Vendor Quotation";
    case "purchase_quotation_request":
      return "Purchase Quotation Request";
    case "grn":
      return "Goods Receipt Note";
      
    default:
      return type.split("_").map(capitalizeFirstLetter).join(" ");
  }
}

export function getStatusLabel(status: string): string {
  return status.split("_").map(capitalizeFirstLetter).join(" ");
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const periodOptions = [
  { label: "Today", value: "today", days: 1 },
  { label: "Last 7 Days", value: "7days", days: 7 },
  { label: "Last 30 Days", value: "30days", days: 30 },
  { label: "Last 90 Days", value: "90days", days: 90 },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
  { label: "All Time", value: "allTime" },
];

export const transactionTypeOptions = [
  { label: "All Types", value: "all" },
  
  // Sales transaction types
  { label: "Sales Invoices", value: "sales_invoice" },
  { label: "Sales Orders", value: "sales_order" },
  { label: "Estimates", value: "estimate" },
  { label: "Quotations", value: "quotation" },
  { label: "Quotation Requests", value: "quotation_request" },
  { label: "Delivery Notes", value: "delivery_note" },
  { label: "Receipts", value: "receipt" },
  { label: "Debit Notes", value: "debit_note" },
  
  // Purchase transaction types
  { label: "Purchase Bills", value: "purchase_bill" },
  { label: "Purchase Orders", value: "purchase_order" },
  { label: "Purchase Quotation Requests", value: "purchase_quotation_request" },
  { label: "Vendor Quotations", value: "purchase_quotation" },
  { label: "Goods Receipt Notes", value: "grn" },
  { label: "Credit Notes", value: "credit_note" },
  { label: "Payments", value: "payment" },
];

export const statusOptions = [
  { label: "All Statuses", value: "all", color: "gray" },
  
  // Common statuses
  { label: "Draft", value: "draft", color: "gray" },
  { label: "Pending", value: "pending", color: "yellow" },
  { label: "Approved", value: "approved", color: "green" },
  { label: "Completed", value: "completed", color: "green" },
  { label: "Rejected", value: "rejected", color: "red" },
  { label: "Overdue", value: "overdue", color: "red" },
  { label: "Cancelled", value: "cancelled", color: "red" },
  { label: "Closed", value: "closed", color: "gray" },
  { label: "Open", value: "open", color: "emerald" },
  
  // Payment statuses
  { label: "Paid", value: "paid", color: "green" },
  { label: "Partially Paid", value: "partially_paid", color: "blue" },
  { label: "Using BNPL", value: "using_bnpl", color: "purple" },
  
  // Sales specific statuses
  { label: "Sent", value: "sent", color: "sky" },
  { label: "Responded", value: "responded", color: "emerald" },
  { label: "Order Placed", value: "order_placed", color: "yellow" },
  { label: "Packing", value: "packing", color: "yellow" },
  { label: "Shipped", value: "shipped", color: "yellow" },
  { label: "Delivered", value: "delivered", color: "green" },
  { label: "Billed", value: "billed", color: "sky" },
  { label: "Partially Billed", value: "partially_billed", color: "blue" },
  
  // Purchase specific statuses
  { label: "Received", value: "received", color: "emerald" },
  { label: "Accepted", value: "accepted", color: "green" },
  { label: "Partially Received", value: "partially_received", color: "blue" },
  { label: "Vendor Accepted", value: "vendor_accepted", color: "green" },
  { label: "Vendor Rejected", value: "vendor_rejected", color: "red" },
  { label: "Goods Received", value: "goods_received", color: "green" },
  { label: "Invoice Received", value: "invoice_received", color: "sky" },
  { label: "Refund Received", value: "refund_received", color: "sky" },
  { label: "In Transit", value: "in_transit", color: "yellow" },
];

export function getPartyTypeLabel(type: string): string {
  switch (type) {
    case "customer":
      return "Customer";
    case "vendor":
      return "Vendor";
    case "both":
      return "Customer & Vendor";
    default:
      return type;
  }
}
