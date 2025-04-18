import { createContext } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InventoryIn from "@/pages/inventory-in";
import InventoryOut from "@/pages/inventory-out";
import Reports from "@/pages/reports";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import MainLayout from "@/components/layouts/MainLayout";

// User context type
type User = {
  id: number;
  username: string;
  fullName: string;
  role: string;
};

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
};

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(user !== null);
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
        <TooltipProvider>
          <Switch>
            <Route path="/login">
              {isAuthenticated ? <Route path="/" /> : <Login />}
            </Route>
            
            <Route path="/">
              {isAuthenticated ? (
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route path="/inventory-in">
              {isAuthenticated ? (
                <MainLayout>
                  <InventoryIn />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route path="/inventory-out">
              {isAuthenticated ? (
                <MainLayout>
                  <InventoryOut />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route path="/reports">
              {isAuthenticated ? (
                <MainLayout>
                  <Reports />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route path="/users">
              {isAuthenticated ? (
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route path="/settings">
              {isAuthenticated ? (
                <MainLayout>
                  <Settings />
                </MainLayout>
              ) : (
                <Route path="/login" />
              )}
            </Route>
            
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
