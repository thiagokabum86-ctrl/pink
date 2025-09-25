import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShoppingCartProps {
  className?: string;
}

export default function ShoppingCart({ className }: ShoppingCartProps) {
  const { 
    items, 
    isOpen, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    closeCart 
  } = useCart();
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const handlePixUpCheckout = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Get session ID from localStorage (used for guest cart)
      const sessionId = localStorage.getItem('cart-session-id') || crypto.randomUUID();
      
      // SECURITY: Only send session ID - server will recalculate totals
      const checkoutData = {
        sessionId: sessionId,
        customer: {
          name: 'Cliente WePink',
          email: '', // TODO: Get from user input if logged in
          phone: ''
        },
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
        webhook_url: `${window.location.origin}/api/pixup/webhook`
      };

      console.log('Criando pagamento PixUp (seguro):', checkoutData);
      
      // Call secure API that recalculates totals server-side
      const response = await apiRequest('POST', '/api/pixup/create-payment', checkoutData);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento');
      }
      
      if (result.success && result.payment?.checkout_url) {
        console.log('Pagamento criado:', {
          paymentId: result.payment.id,
          orderId: result.payment.order_id,
          amount: result.payment.amount,
          checkoutUrl: result.payment.checkout_url
        });
        
        toast({
          title: "Pagamento Criado!",
          description: `Pedido #${result.payment.order_id} - R$ ${result.payment.amount.toFixed(2).replace('.', ',')}`,
        });
        
        // Redirect to PixUp checkout URL for real payment
        if (result.payment.checkout_url && result.payment.checkout_url.includes('pixupbr.com')) {
          // Real PixUp checkout URL - redirect directly
          window.location.href = result.payment.checkout_url;
        } else {
          // Fallback to pending page for development
          setTimeout(() => {
            window.location.href = `/pending?payment_id=${result.payment.id}`;
          }, 1500);
        }
        
      } else {
        throw new Error('Resposta inválida da API PixUp');
      }
      
    } catch (error: any) {
      console.error('Erro no checkout PixUp:', error);
      
      // Show specific error messages
      let errorMessage = "Erro ao processar pagamento. Tente novamente.";
      
      if (error.message?.includes('Carrinho vazio')) {
        errorMessage = "Seu carrinho está vazio. Adicione produtos antes de finalizar.";
      } else if (error.message?.includes('Dados inválidos')) {
        errorMessage = "Dados do checkout inválidos. Verifique e tente novamente.";
      } else if (error.message?.includes('Valor inválido')) {
        errorMessage = "Valor do pedido inválido. Atualize a página e tente novamente.";
      }
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" data-testid="cart-overlay">
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">
              Carrinho ({totalItems})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeCart}
              data-testid="button-close-cart"
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Seu carrinho está vazio
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Adicione produtos para começar suas compras
                </p>
                <Button 
                  onClick={closeCart}
                  data-testid="button-continue-shopping"
                  className="bg-primary text-primary-foreground"
                >
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start space-x-3 p-3 rounded-lg border"
                    data-testid={`cart-item-${item.id}`}
                  >
                    {/* Product image placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product?.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.product?.name || 'Produto'}
                      </h3>
                      <p className="text-lg font-bold text-primary mt-1">
                        R$ {item.product ? parseFloat(item.product.currentPrice).toFixed(2).replace('.', ',') : '0,00'}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          disabled={item.quantity === 1}
                          data-testid={`button-decrease-${item.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span 
                          className="min-w-[2rem] text-center text-sm font-medium"
                          data-testid={`quantity-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          data-testid={`button-increase-${item.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      data-testid={`button-remove-${item.id}`}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Clear cart button */}
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    data-testid="button-clear-cart"
                    className="w-full text-red-500 hover:text-red-700 border-red-200"
                  >
                    Limpar Carrinho
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary" data-testid="cart-total">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <Button 
                onClick={handlePixUpCheckout}
                disabled={isProcessingPayment || items.length === 0}
                className="w-full bg-primary text-primary-foreground h-12 text-base font-semibold disabled:opacity-50"
                data-testid="button-checkout"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Finalizar Compra'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}