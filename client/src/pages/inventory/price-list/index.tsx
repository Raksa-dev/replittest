import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Item } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const PriceListIndex = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['/api/inventory/items'],
  });

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Price List</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage product pricing across different customer segments
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/price-list/new">
            <Button className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Price
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Price List</CardTitle>
              <CardDescription>
                View and manage item pricing for different customer segments
              </CardDescription>
            </div>
            <div className="max-w-sm">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Retail Price</TableHead>
                    <TableHead>Wholesale Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.hsnCode || "-"}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(item.sellingPrice || "0"))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(item.sellingPrice || "0") * 1.1)}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(item.sellingPrice || "0") * 0.95)}</TableCell>
                      <TableCell>{item.openingStock || 0}</TableCell>
                      <TableCell>{item.unit || "-"}</TableCell>
                      <TableCell>
                        <Link href={`/inventory/price-list/${item.id}`}>
                          <Button variant="ghost" size="sm" className="cursor-pointer">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900">No items found</h3>
              <p className="mt-1 text-neutral-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by adding items to your inventory"}
              </p>
              <div className="mt-4">
                <Link href="/inventory/stock-items/new">
                  <Button className="cursor-pointer">Add New Item</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceListIndex;