import { useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { AuthContext } from '@/App';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, BarChart2, FileInput, FileOutput, Settings, Users } from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = () => {
    setUser(null);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart2, current: location === '/' },
    { name: 'Inventory In', href: '/inventory-in', icon: FileInput, current: location === '/inventory-in' },
    { name: 'Inventory Out', href: '/inventory-out', icon: FileOutput, current: location === '/inventory-out' },
    { name: 'Reports & MIS', href: '/reports', icon: BarChart2, current: location === '/reports' },
  ];

  const adminNavigation = [
    { name: 'User Management', href: '/users', icon: Users, current: location === '/users' },
    { name: 'Settings', href: '/settings', icon: Settings, current: location === '/settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md z-10 flex-shrink-0 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="h-10 w-10 flex items-center justify-center rounded bg-primary text-white mr-2">
            <span className="font-bold">HC</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">High Court</h1>
            <p className="text-xs text-neutral-600">Document Digitization System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-4 flex-1">
        <div className="px-4 py-2">
          <p className="text-xs font-semibold uppercase text-neutral-500">Main Menu</p>
        </div>
        
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className={cn(
              "flex items-center px-4 py-3 hover:bg-neutral-100",
              item.current 
                ? "bg-neutral-100 text-primary font-medium" 
                : "text-neutral-700"
            )}>
              <item.icon className="w-5 h-5" />
              <span className="ml-2">{item.name}</span>
            </a>
          </Link>
        ))}
        
        {user?.role === 'admin' && (
          <>
            <div className="px-4 py-2 mt-4">
              <p className="text-xs font-semibold uppercase text-neutral-500">Admin</p>
            </div>
            
            {adminNavigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex items-center px-4 py-3 hover:bg-neutral-100",
                  item.current 
                    ? "bg-neutral-100 text-primary font-medium" 
                    : "text-neutral-700"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="ml-2">{item.name}</span>
                </a>
              </Link>
            ))}
          </>
        )}
      </nav>
      
      <div className="border-t border-neutral-200 py-4 px-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-white">
              {user?.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-auto text-neutral-400 hover:text-neutral-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
