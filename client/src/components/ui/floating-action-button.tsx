
import { Button } from "./button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useLocation } from "wouter";

export function FloatingActionButton() {
  const [_, setLocation] = useLocation();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setLocation("/sales/invoices/new")}>
            New Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/orders/new")}>
            New Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/estimates/new")}>
            New Estimate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/quotation-requests/new")}>
            New Quotation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/delivery-notes/new")}>
            New Delivery Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/receipts/new")}>
            New Receipt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/sales/returns/new")}>
            New Return
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
