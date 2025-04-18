import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Settings,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(true);
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-14 bottom-0 overflow-y-auto z-10 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <nav className="px-4 py-5">
        <div className="space-y-1">
          <Link href="/">
            <a 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                isActive("/") 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              )}
            >
              <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
              {!collapsed && <span>Dashboard</span>}
            </a>
          </Link>
          
          <div>
            <button 
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md group"
            >
              <FileText className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
              {!collapsed && (
                <>
                  <span>Inventory Management</span>
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    inventoryOpen ? "transform rotate-180" : ""
                  )} />
                </>
              )}
            </button>
            
            {(inventoryOpen || collapsed) && (
              <div className={cn("mt-1 space-y-1", collapsed ? "" : "ml-8")}>
                <Link href="/inventory-in">
                  <a 
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive("/inventory-in") 
                        ? "text-primary-600 bg-primary-50" 
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    )}
                  >
                    {collapsed ? (
                      <FileText className="h-5 w-5 text-gray-500" />
                    ) : (
                      <span>Inventory In</span>
                    )}
                  </a>
                </Link>
                <Link href="/inventory-out">
                  <a 
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive("/inventory-out") 
                        ? "text-primary-600 bg-primary-50" 
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    )}
                  >
                    {collapsed ? (
                      <ClipboardList className="h-5 w-5 text-gray-500" />
                    ) : (
                      <span>Inventory Out</span>
                    )}
                  </a>
                </Link>
              </div>
            )}
          </div>
          
          <Link href="/lifecycle-tracking">
            <a 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                isActive("/lifecycle-tracking") 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              )}
            >
              <ClipboardList className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
              {!collapsed && <span>Lifecycle Tracking</span>}
            </a>
          </Link>
          
          <Link href="/reports">
            <a 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                isActive("/reports") 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              )}
            >
              <BarChart3 className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
              {!collapsed && <span>Reports & MIS</span>}
            </a>
          </Link>
          
          <Link href="/settings">
            <a 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                isActive("/settings") 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              )}
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
              {!collapsed && <span>Settings</span>}
            </a>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
