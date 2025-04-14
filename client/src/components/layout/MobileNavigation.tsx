import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MobileNavigation = () => {
  const [location] = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const isActiveLink = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setShowMenu(false)}>
          <div className="bg-white h-[70vh] overflow-y-auto w-full px-4 py-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setShowMenu(false)} className="text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Main Navigation</h3>
                <Link href="/">
                  <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                    isActiveLink("/") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                  )}>Dashboard</div>
                </Link>
                
                <div className="mt-2">
                  <Link href="/search">
                    <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                      isActiveLink("/search") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                    )}>Search</div>
                  </Link>
                  {isActiveLink("/search") && (
                    <div className="pl-6 mt-1 space-y-1">
                      <Link href="/search/products">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/search/products") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Products</div>
                      </Link>
                      <Link href="/search/vendors">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/search/vendors") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Vendors</div>
                      </Link>
                      <Link href="/search/my-listings">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/search/my-listings") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>My Listings</div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Transaction Navigation */}
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Transactions</h3>
                
                <div className="mt-1">
                  <Link href="/sales">
                    <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                      isActiveLink("/sales") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                    )}>Sales</div>
                  </Link>
                  {isActiveLink("/sales") && (
                    <div className="pl-6 mt-1 space-y-1">
                      <Link href="/sales/quotation-requests">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/sales/quotation-requests") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Quotation Requests</div>
                      </Link>
                      <Link href="/sales/estimates">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/sales/estimates") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Estimates</div>
                      </Link>
                      <Link href="/sales/orders">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/sales/orders") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Orders</div>
                      </Link>
                      <Link href="/sales/invoices">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/sales/invoices") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Invoices</div>
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <Link href="/purchases">
                    <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                      isActiveLink("/purchases") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                    )}>Purchases</div>
                  </Link>
                  {isActiveLink("/purchases") && (
                    <div className="pl-6 mt-1 space-y-1">
                      <Link href="/purchases/quotation-requests">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/purchases/quotation-requests") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Quotation Requests</div>
                      </Link>
                      <Link href="/purchases/bills">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/purchases/bills") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Bills</div>
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <Link href="/inventory">
                    <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                      isActiveLink("/inventory") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                    )}>Inventory</div>
                  </Link>
                  {isActiveLink("/inventory") && (
                    <div className="pl-6 mt-1 space-y-1">
                      <Link href="/inventory/stock-items">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/inventory/stock-items") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Stock Items</div>
                      </Link>
                      <Link href="/inventory/stock-groups">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/inventory/stock-groups") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Stock Groups</div>
                      </Link>
                      <Link href="/inventory/godowns">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/inventory/godowns") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Godowns</div>
                      </Link>
                      <Link href="/inventory/units">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/inventory/units") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Units</div>
                      </Link>
                      <Link href="/inventory/price-list">
                        <div className={cn("block py-1.5 px-3 text-sm rounded-md cursor-pointer",
                          isActiveLink("/inventory/price-list") ? "bg-primary-50 text-primary-600" : "text-neutral-600"
                        )}>Price List</div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Configuration */}
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Configuration</h3>
                <Link href="/master-data">
                  <div className={cn("block py-2 px-3 rounded-md cursor-pointer",
                    isActiveLink("/master-data") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                  )}>Master Data</div>
                </Link>
                <Link href="/settings">
                  <div className={cn("block py-2 px-3 rounded-md mt-1 cursor-pointer",
                    isActiveLink("/settings") ? "bg-primary-50 text-primary-600 font-medium" : "text-neutral-700"
                  )}>Settings</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 z-20">
        <div className="flex justify-around py-2">
          <Link href="/">
            <div className={cn("px-3 py-2 flex flex-col items-center cursor-pointer",
              isActiveLink("/") ? "text-primary-600" : "text-neutral-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </div>
          </Link>
          
          <Link href="/sales">
            <div className={cn("px-3 py-2 flex flex-col items-center cursor-pointer",
              isActiveLink("/sales") ? "text-primary-600" : "text-neutral-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1">Sales</span>
            </div>
          </Link>
          
          <Link href="/purchases">
            <div className={cn("px-3 py-2 flex flex-col items-center cursor-pointer",
              isActiveLink("/purchases") ? "text-primary-600" : "text-neutral-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-xs mt-1">Purchases</span>
            </div>
          </Link>
          
          <button 
            onClick={() => setShowMenu(true)}
            className="px-3 py-2 flex flex-col items-center text-neutral-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
