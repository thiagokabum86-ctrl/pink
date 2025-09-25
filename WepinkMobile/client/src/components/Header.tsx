import { Menu, User, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { useState } from "react";
import wepinkLogo from "@assets/001c75d2-acbb-447d-b97d-8e3882f59cc9_1758762268822.png";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { openCart, totalItems } = useCart();
  const [, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserClick = () => {
    if (!user) {
      setLocation("/auth");
    } else {
      setShowUserMenu(!showUserMenu);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Header Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
        <a href="#" className="underline" data-testid="link-kit-banner">Garanta agora</a> o seu kit we favorito!
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-border px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center">
        <div></div> {/* Empty left column */}
        
        <div className="justify-self-center">
          <img 
            src={wepinkLogo} 
            alt="WePink" 
            className="h-8 w-auto object-contain"
            data-testid="logo-wepink"
          />
        </div>
        
        <div className="flex items-center space-x-2 justify-self-end">
          <div className="relative">
            <button 
              className={`p-2 relative ${user ? 'text-primary' : ''}`}
              onClick={handleUserClick}
              data-testid="button-profile"
            >
              <User className="w-6 h-6" />
              {user && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              )}
            </button>

            {/* User Menu Dropdown */}
            {user && showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">Logado</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
          <button 
            className="p-2 hover:text-primary transition-colors relative" 
            onClick={() => openCart()}
            data-testid="button-cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <div 
                className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]"
                data-testid="cart-badge"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </div>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
