// Simplified static auth - localStorage based
import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Simple user type for static site
type StaticUser = {
  id: string;
  username: string;
};

type LoginData = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: StaticUser | null;
  isLoading: boolean;
  loginMutation: {
    mutate: (data: LoginData) => void;
    isPending: boolean;
  };
  logoutMutation: {
    mutate: () => void;
    isPending: boolean;
  };
  registerMutation: {
    mutate: (data: LoginData) => void;
    isPending: boolean;
  };
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<StaticUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const savedUser = localStorage.getItem('wepink_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('wepink_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginMutation = {
    mutate: (credentials: LoginData) => {
      setLoginPending(true);
      
      // Simulate login delay
      setTimeout(() => {
        // Simple validation - accept any email/password combo
        if (credentials.username && credentials.password) {
          const newUser: StaticUser = {
            id: Math.random().toString(36),
            username: credentials.username
          };
          
          setUser(newUser);
          localStorage.setItem('wepink_user', JSON.stringify(newUser));
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${credentials.username}!`,
          });
        } else {
          toast({
            title: "Erro no login",
            description: "Preencha todos os campos",
            variant: "destructive",
          });
        }
        
        setLoginPending(false);
      }, 800);
    },
    isPending: loginPending
  };

  const registerMutation = {
    mutate: (credentials: LoginData) => {
      setRegisterPending(true);
      
      // Simulate register delay
      setTimeout(() => {
        if (credentials.username && credentials.password) {
          const newUser: StaticUser = {
            id: Math.random().toString(36),
            username: credentials.username
          };
          
          setUser(newUser);
          localStorage.setItem('wepink_user', JSON.stringify(newUser));
          
          toast({
            title: "Conta criada com sucesso!",
            description: `Bem-vindo, ${credentials.username}!`,
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: "Preencha todos os campos",
            variant: "destructive",
          });
        }
        
        setRegisterPending(false);
      }, 800);
    },
    isPending: registerPending
  };

  const logoutMutation = {
    mutate: () => {
      setLogoutPending(true);
      
      setTimeout(() => {
        setUser(null);
        localStorage.removeItem('wepink_user');
        
        toast({
          title: "Logout realizado",
          description: "Você saiu da sua conta com segurança",
        });
        
        setLogoutPending(false);
      }, 300);
    },
    isPending: logoutPending
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}