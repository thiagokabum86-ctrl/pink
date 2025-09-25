import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type PaymentStatus = 'pending' | 'approved' | 'cancelled' | 'failed';

export default function PaymentPending() {
  const [location] = useLocation();
  const [paymentId, setPaymentId] = useState<string>("");
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  useEffect(() => {
    // Extrair payment_id dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('payment_id') || urlParams.get('id');
    if (id) {
      setPaymentId(id);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Verificar status automaticamente a cada 5 segundos
    if (autoCheckEnabled && paymentId && status === 'pending') {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentId, status, autoCheckEnabled]);

  const checkPaymentStatus = async () => {
    if (!paymentId || isChecking) return;
    
    try {
      setIsChecking(true);
      const response = await apiRequest('GET', `/api/pixup/payment/${paymentId}/status`);
      const result = await response.json();
      
      if (response.ok && result.status) {
        setStatus(result.status);
        
        // Se status mudou para aprovado ou falhou, parar verificação automática
        if (result.status !== 'pending') {
          setAutoCheckEnabled(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          title: 'Pagamento Aprovado!',
          description: 'Seu pagamento foi processado com sucesso.',
          actionText: 'Ver Confirmação',
          actionLink: '/success?payment_id=' + paymentId
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          title: 'Pagamento Falhou',
          description: 'Houve um problema ao processar seu pagamento.',
          actionText: 'Tentar Novamente',
          actionLink: '/cancel?reason=payment_failed'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          title: 'Pagamento Cancelado',
          description: 'O pagamento foi cancelado.',
          actionText: 'Voltar à Loja',
          actionLink: '/cancel?reason=cancelled'
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          title: 'Aguardando Pagamento',
          description: 'Estamos verificando o status do seu pagamento...',
          actionText: 'Verificar Novamente',
          actionLink: null
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de status */}
        <div className="mb-6">
          <div className={`mx-auto w-20 h-20 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-12 h-12 ${statusInfo.color} ${status === 'pending' && !isChecking ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {statusInfo.title}
        </h1>

        {/* Descrição */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {statusInfo.description}
        </p>

        {/* ID do pagamento */}
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

        {/* Status específico para pending */}
        {status === 'pending' && (
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                {isChecking && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />}
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isChecking ? 'Verificando status...' : 'Verificação automática ativa'}
                </p>
              </div>
            </div>

            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Métodos de pagamento PIX:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• QR Code no aplicativo</li>
                <li>• Chave PIX copiada</li>
                <li>• Confirmação pode levar alguns minutos</li>
              </ul>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          {statusInfo.actionLink ? (
            <Link href={statusInfo.actionLink} data-testid="link-status-action">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {statusInfo.actionText}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={checkPaymentStatus}
              disabled={isChecking}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-check-status"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  {statusInfo.actionText}
                </>
              )}
            </Button>
          )}
          
          <Link href="/" data-testid="link-back-home">
            <Button variant="outline" className="w-full">
              Voltar à Loja
            </Button>
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {status === 'pending' 
              ? 'O status será atualizado automaticamente quando o pagamento for confirmado'
              : 'Para mais informações, entre em contato conosco'
            }
          </p>
        </div>
      </div>
    </div>
  );
}