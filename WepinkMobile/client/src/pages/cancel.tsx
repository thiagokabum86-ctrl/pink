import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancel() {
  const [location] = useLocation();
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    // Extrair motivo do cancelamento dos parâmetros da URL se existir
    const urlParams = new URLSearchParams(window.location.search);
    const cancelReason = urlParams.get('reason') || urlParams.get('error');
    if (cancelReason) {
      setReason(cancelReason);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de cancelamento */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Pagamento Cancelado
        </h1>

        {/* Mensagem de cancelamento */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Seu pagamento foi cancelado. Nenhuma cobrança foi realizada.
        </p>

        {/* Motivo do cancelamento se disponível */}
        {reason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Motivo:</strong> {reason}
            </p>
          </div>
        )}

        {/* Opções do usuário */}
        <div className="space-y-4 mb-8">
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              O que você pode fazer:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Tentar o pagamento novamente</li>
              <li>• Escolher outro método de pagamento</li>
              <li>• Revisar os itens do seu carrinho</li>
              <li>• Entrar em contato conosco se precisar de ajuda</li>
            </ul>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link href="/" data-testid="link-try-again">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <RefreshCw className="mr-2 w-4 h-4" />
              Tentar Novamente
            </Button>
          </Link>
          
          <Link href="/" data-testid="link-back-home">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar à Loja
            </Button>
          </Link>
        </div>

        {/* Informações de suporte */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Precisa de Ajuda?
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nossa equipe está disponível 24/7 para ajudá-lo com qualquer problema
          </p>
        </div>
      </div>
    </div>
  );
}