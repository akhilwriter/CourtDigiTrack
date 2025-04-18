import { createContext } from "react";

// User context type
export type User = {
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