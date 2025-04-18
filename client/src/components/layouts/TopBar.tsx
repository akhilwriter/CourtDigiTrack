import { useState } from 'react';
import { Bell, Search, HelpCircle, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 text-neutral-400 hover:text-neutral-600 lg:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input 
            type="text" 
            placeholder="Search CNR, Case Number..." 
            className="pl-10 pr-4 py-2 w-64" 
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="relative p-2 text-neutral-400 hover:text-neutral-600 mr-2">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-destructive rounded-full border border-white"></span>
        </Button>
        
        <Button variant="ghost" size="icon" className="p-2 text-neutral-400 hover:text-neutral-600 mr-2">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
