import { useContext, useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { AuthContext, type User } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, setUser, isAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Check for existing user session
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("court_user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("court_user");
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [setUser]);
  
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("court_user", JSON.stringify(userData));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
      
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("court_user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  return {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  };
}
