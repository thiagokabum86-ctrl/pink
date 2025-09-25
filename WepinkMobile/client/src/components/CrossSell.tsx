import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Check } from "lucide-react";
import { MAIN_PRODUCT, CROSS_SELL_PRODUCTS, PRODUCT_CATALOG } from "@/data/products";

export default function CrossSell() {
  const { addToCart, openCart } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  // Estado para controlar quais produtos estão selecionados
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Use unified product catalog
  const mainProduct = MAIN_PRODUCT;
  const secondProductOptions = CROSS_SELL_PRODUCTS;

  // Calcular subtotal baseado na seleção
  const calculateSubtotal = () => {
    let total = 0;
    
    // Adicionar produto principal se existir
    if (mainProduct) {
      total += parseFloat(mainProduct.currentPrice);
    }
    
    // Adicionar produtos selecionados
    selectedProducts.forEach(productId => {
      const product = PRODUCT_CATALOG.find(p => p.id === productId);
      if (product) {
        total += parseFloat(product.currentPrice);
      }
    });
    
    return total;
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // Para este caso, só permitir um produto adicional
        return [productId];
      }
    });
  };

  const handleAddBundleToCart = async () => {
    const productsToAdd = [];
    
    // Adicionar produto principal
    if (mainProduct) {
      productsToAdd.push(mainProduct.id);
    }
    
    // Adicionar produtos selecionados
    selectedProducts.forEach(productId => {
      productsToAdd.push(productId);
    });

    if (productsToAdd.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para adicionar ao carrinho.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsAdding(true);
    try {
      // Adicionar todos os produtos selecionados
      for (const productId of productsToAdd) {
        await addToCart(productId, 1);
      }
      
      toast({
        title: "Produtos adicionados ao carrinho!",
        description: `${productsToAdd.length} produtos foram adicionados ao seu carrinho.`,
        duration: 3000,
      });
      
      openCart();
    } catch (error) {
      toast({
        title: "Erro ao adicionar ao carrinho",
        description: "Tente novamente em instantes.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const subtotal = calculateSubtotal();
  const itemCount = (mainProduct ? 1 : 0) + selectedProducts.length;

  return (
    <div className="px-4 mb-8">
      <h2 className="text-xl font-bold mb-6 text-center text-primary" data-testid="text-cross-sell-title">
        COMPRE JUNTO
      </h2>
      
      <div className="space-y-4">
        {/* Produto Principal - Sem checkbox */}
        {mainProduct && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center space-x-3">
              <img 
                src={mainProduct.images?.[0] || "https://wepink.vtexassets.com/arquivos/ids/160550/vf-bloom-1.jpg.jpg?v=638822664318700000"}
                alt={mainProduct.name}
                className="w-16 h-16 object-cover rounded-lg"
                data-testid="img-main-product"
              />
              <div className="flex-1">
                <h3 className="font-medium text-primary text-sm">
                  {mainProduct.name}
                </h3>
                <p className="text-sm text-gray-600">
                  A partir de R$ {parseFloat(mainProduct.currentPrice).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Símbolo de + */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">+</div>
        </div>

        {/* Produtos Opcionais */}
        {secondProductOptions.map((product) => (
          product && (
            <div 
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:border-primary transition-colors"
              onClick={() => toggleProductSelection(product.id)}
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={product.images?.[0] || "https://wepink.vtexassets.com/arquivos/ids/160560/vf-ballet-1.jpg.jpg?v=638822666799870000"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  data-testid={`img-option-${product.id}`}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-primary text-sm">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    A partir de R$ {parseFloat(product.currentPrice).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedProducts.includes(product.id) 
                    ? 'bg-primary border-primary' 
                    : 'border-gray-300'
                }`}>
                  {selectedProducts.includes(product.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          )
        ))}

        {/* Subtotal e Botão */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900">Subtotal</h4>
            <p className="text-lg font-bold text-primary" data-testid="text-subtotal">
              A partir de R$ {subtotal.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-sm text-gray-600">
              (Ou até 6x de R$ {(subtotal / 6).toFixed(2).replace(".", ",")})
            </p>
          </div>
          
          <button 
            onClick={handleAddBundleToCart}
            disabled={isAdding || itemCount === 0}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
            data-testid="button-add-bundle"
          >
            {isAdding ? "Adicionando..." : `Adicionar ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
