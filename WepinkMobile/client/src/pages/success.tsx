import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const [paymentId, setPaymentId] = useState<string>("");

  useEffect(() => {
    // Extrair payment_id dos parâmetros da URL se existir
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('payment_id') || urlParams.get('id');
    if (id) {
      setPaymentId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de sucesso */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Pagamento Aprovado!
        </h1>

        {/* Mensagem de sucesso */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Seu pedido foi processado com sucesso. Você receberá um email de confirmação em breve.
        </p>

        {/* ID do pagamento se disponível */}
        {paymentId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              ID do Pagamento
            </p>
            <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
              {paymentId}
            </p>
          </div>
        )}

        {/* Status e próximos passos */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <Package className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Processando Pedido
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Preparando seus produtos para entrega
              </p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link href="/" data-testid="link-continue-shopping">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Continuar Comprando
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          
          <Link href="/pedidos" data-testid="link-view-orders">
            <Button variant="outline" className="w-full">
              Ver Meus Pedidos
            </Button>
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dúvidas? Entre em contato conosco pelo WhatsApp ou email
          </p>
        </div>
      </div>
    </div>
  );
}