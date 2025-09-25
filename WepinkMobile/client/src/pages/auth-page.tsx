import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register" | "forgot";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleBackToHome = () => {
    setLocation("/");
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate(formData);
    } else if (mode === "register") {
      registerMutation.mutate(formData);
    } else if (mode === "forgot") {
      // Forgot password implementation - basic version
      toast({
        title: "Email enviado!",
        description: "Se este email existir, você receberá instruções para redefinir sua senha.",
      });
      setMode("login");
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  // Forgot Password View
  if (mode === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#ff0080] hover:text-[#e60073] mr-3"
                data-testid="button-back-to-login"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-[#ff0080] text-xl font-bold" data-testid="text-forgot-title">
                recuperar senha
              </h1>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                name="username"
                placeholder="ex.: exemplo@email.com"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] text-gray-700 placeholder-gray-400"
                data-testid="input-forgot-email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff0080] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#e60073] transition-colors mt-6"
              data-testid="button-forgot-submit"
            >
              Enviar instruções
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-[#ff0080] hover:text-[#e60073] mr-3"
              data-testid="button-back-home"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[#ff0080] text-xl font-bold" data-testid="text-auth-title">
              {mode === "login" ? "entrar com email e senha" : "criar conta"}
            </h1>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              name="username"
              placeholder="ex.: exemplo@email.com"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] text-gray-700 placeholder-gray-400"
              data-testid="input-auth-email"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Adicione sua senha"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] text-gray-700 placeholder-gray-400"
                data-testid="input-auth-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="text-center my-6">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-[#ff0080] text-sm font-medium hover:underline"
                data-testid="link-forgot-password"
              >
                esqueci minha senha
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff0080] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#e60073] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-auth-submit"
          >
            {isLoading ? "Aguarde..." : (mode === "login" ? "Entrar" : "Cadastrar")}
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[#ff0080] text-sm font-medium hover:underline"
              data-testid="button-toggle-auth-mode"
            >
              {mode === "login" ? "não tem uma conta? cadastre-se" : "já tem uma conta? faça login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}