import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/context/SidebarContext";
import MainLayout from "@/components/layout/MainLayout";
import NotFound from "@/pages/not-found";

// Page imports
import Dashboard from "@/pages/dashboard";
import Search from "@/pages/search";
import ProductSearch from "@/pages/search/products";
import VendorsSearch from "@/pages/search/vendors";
import MyListings from "@/pages/search/my-listings";
import Sales from "@/pages/sales";
import Purchases from "@/pages/purchases";
import Inventory from "@/pages/inventory";
import StockItemsList from "@/pages/inventory/stock-items/list";
import NewStockItem from "@/pages/inventory/stock-items/new";
import StockGroupsList from "@/pages/inventory/stock-groups/list";
import NewStockGroup from "@/pages/inventory/stock-groups/new";
import GodownsList from "@/pages/inventory/godowns/list"; 
import NewGodown from "@/pages/inventory/godowns/new";
import UnitsList from "@/pages/inventory/units/list";
import NewUnit from "@/pages/inventory/units/new";
import PriceList from "@/pages/inventory/price-list";
import MasterData from "@/pages/master-data";
import Settings from "@/pages/settings";

// Sales Sub-Pages
import QuotationRequests from "@/pages/sales/quotation-requests";
import NewQuotationRequest from "@/pages/sales/quotation-requests/new";
import QuotationRequestDetail from "@/pages/sales/quotation-requests/[id]";
import Estimates from "@/pages/sales/estimates";
import NewEstimate from "@/pages/sales/estimates/new";
import Orders from "@/pages/sales/orders";
import NewOrder from "@/pages/sales/orders/new";
import Invoices from "@/pages/sales/invoices";
import NewInvoice from "@/pages/sales/invoices/new";
import NewDebitNote from "@/pages/sales/debit-notes/new";
import DeliveryNotes from "@/pages/sales/delivery-notes";
import NewDeliveryNote from "@/pages/sales/delivery-notes/new";
import Receipts from "@/pages/sales/receipts";
import NewReceipt from "@/pages/sales/receipts/new";
import Returns from "@/pages/sales/returns";
import NewReturn from "@/pages/sales/returns/new";

// Purchase Sub-Pages
import PurchaseQuotationRequests from "@/pages/purchases/quotation-requests";
import NewPurchaseQuotationRequest from "@/pages/purchases/quotation-requests/new";
import NewPurchaseOrder from "@/pages/purchases/orders/new";
import PurchaseBills from "@/pages/purchases/bills";
import NewBill from "@/pages/purchases/bills/new";
import NewPayment from "@/pages/purchases/payments/new";
import NewCreditNote from "@/pages/purchases/returns/new";

// Finance Module
import Finance from "@/pages/finance";
import ReceivablesInvoices from "@/pages/finance/receivables/invoices";
import PayablesBills from "@/pages/finance/payables/bills";
import Customers from "@/pages/finance/receivables/customers";
import CustomerDetail from "@/pages/finance/receivables/customers/[id]";
import Vendors from "@/pages/finance/payables/vendors";
import VendorDetail from "@/pages/finance/payables/vendors/[id]";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/search" component={Search} />
        <Route path="/search/products" component={ProductSearch} />
        <Route path="/search/vendors" component={VendorsSearch} />
        <Route path="/search/my-listings" component={MyListings} />

        {/* Sales and Sub-pages */}
        <Route path="/sales">{() => <Sales />}</Route>
        <Route path="/sales/quotation-requests">{() => <QuotationRequests />}</Route>
        <Route path="/sales/quotation-requests/new">{() => <NewQuotationRequest />}</Route>
        <Route path="/sales/quotation-requests/:id">{(params) => <QuotationRequestDetail id={params.id} />}</Route>
        <Route path="/sales/estimates">{() => <Estimates />}</Route>
        <Route path="/sales/estimates/new">{() => <NewEstimate />}</Route>
        <Route path="/sales/orders">{() => <Orders />}</Route>
        <Route path="/sales/orders/new">{() => <NewOrder />}</Route>
        <Route path="/sales/invoices">{() => <Invoices />}</Route>
        <Route path="/sales/invoices/new">{() => <NewInvoice />}</Route>
        <Route path="/sales/debit-notes/new">{() => <NewDebitNote />}</Route>
        <Route path="/sales/delivery-notes">{() => <DeliveryNotes />}</Route>
        <Route path="/sales/delivery-notes/new">{() => <NewDeliveryNote />}</Route>
        <Route path="/sales/receipts">{() => <Receipts />}</Route>
        <Route path="/sales/receipts/new">{() => <NewReceipt />}</Route>
        <Route path="/sales/returns">{() => <Returns />}</Route>
        <Route path="/sales/returns/new">{() => <NewReturn />}</Route>
        <Route path="/purchases/orders">{() => <PurchaseOrders />}</Route>
        <Route path="/purchases/orders/new">{() => <NewPurchaseOrder />}</Route>
        <Route path="/purchases/payments">{() => <Payments />}</Route>
        <Route path="/purchases/payments/new">{() => <NewPayment />}</Route>
        <Route path="/purchases/returns">{() => <PurchaseReturns />}</Route>
        <Route path="/purchases/returns/new">{() => <NewPurchaseReturn />}</Route>
        <Route path="/master-data/customers/new">{() => <NewCustomer />}</Route>
        <Route path="/master-data/vendors/new">{() => <NewVendor />}</Route>


        {/* Purchases and Sub-pages */}
        <Route path="/purchases">{() => <Purchases />}</Route>
        <Route path="/purchases/quotation-requests">{() => <PurchaseQuotationRequests />}</Route>
        <Route path="/purchases/quotation-requests/new">{() => <NewPurchaseQuotationRequest />}</Route>
        <Route path="/purchases/bills">{() => <PurchaseBills />}</Route>
        <Route path="/purchases/orders/new">{() => <NewPurchaseOrder />}</Route>
        <Route path="/purchases/bills/new">{() => <NewBill />}</Route>
        <Route path="/purchases/payments/new">{() => <NewPayment />}</Route>
        <Route path="/purchases/returns/new">{() => <NewCreditNote />}</Route>

        {/* Reports Module */}
        <Route path="/reports">{() => <Reports />}</Route>

        {/* Finance Module */}
        <Route path="/finance">{() => <Finance />}</Route>

        {/* Receivables Routes */}
        <Route path="/finance/receivables/invoices">{() => <ReceivablesInvoices />}</Route>
        <Route path="/finance/receivables/customers">{() => <Customers />}</Route>
        <Route path="/finance/receivables/customers/:id">
          {(params) => <CustomerDetail id={params.id} />}
        </Route>

        {/* Payables Routes */}
        <Route path="/finance/payables/bills">{() => <PayablesBills />}</Route>
        <Route path="/finance/payables/vendors">{() => <Vendors />}</Route>
        <Route path="/finance/payables/vendors/:id">
          {(params) => <VendorDetail id={params.id} />}
        </Route>

        {/* Inventory Module */}
        <Route path="/inventory">{() => <Inventory />}</Route>
        <Route path="/inventory/stock-items">{() => <StockItemsList />}</Route>
        <Route path="/inventory/stock-items/new">{() => <NewStockItem />}</Route>
        <Route path="/inventory/stock-groups">{() => <StockGroupsList />}</Route>
        <Route path="/inventory/stock-groups/new">{() => <NewStockGroup />}</Route>
        <Route path="/inventory/godowns">{() => <GodownsList />}</Route>
        <Route path="/inventory/godowns/new">{() => <NewGodown />}</Route>
        <Route path="/inventory/units">{() => <UnitsList />}</Route>
        <Route path="/inventory/units/new">{() => <NewUnit />}</Route>
        <Route path="/inventory/price-list">{() => <PriceList />}</Route>
        <Route path="/master-data" component={MasterData} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Router />
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;