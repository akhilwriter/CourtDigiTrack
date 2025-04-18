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
import { AuthContext, type User } from "./contexts/AuthContext";

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
              {isAuthenticated ? <Dashboard /> : <Login />}
            </Route>
            
            <Route path="/">
              {isAuthenticated ? (
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              ) : (
                <Login />
              )}
            </Route>
            
            <Route path="/inventory-in">
              {isAuthenticated ? (
                <MainLayout>
                  <InventoryIn />
                </MainLayout>
              ) : (
                <Login />
              )}
            </Route>
            
            <Route path="/inventory-out">
              {isAuthenticated ? (
                <MainLayout>
                  <InventoryOut />
                </MainLayout>
              ) : (
                <Login />
              )}
            </Route>
            
            <Route path="/reports">
              {isAuthenticated ? (
                <MainLayout>
                  <Reports />
                </MainLayout>
              ) : (
                <Login />
              )}
            </Route>
            
            <Route path="/users">
              {isAuthenticated ? (
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              ) : (
                <Login />
              )}
            </Route>
            
            <Route path="/settings">
              {isAuthenticated ? (
                <MainLayout>
                  <Settings />
                </MainLayout>
              ) : (
                <Login />
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
