import { useState } from "react";
import { Star, StarHalf, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductInfoProps {
  productId: string;
  name: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  currentPrice: number;
  installments: string;
}

export default function ProductInfo({
  productId,
  name,
  subtitle,
  rating,
  reviewCount,
  originalPrice,
  currentPrice,
  installments
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, openCart } = useCart();
  const { toast } = useToast();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 star-filled fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 star-filled fill-current" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 star-empty" />);
    }
    
    return stars;
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(productId, quantity);
      toast({
        title: "Produto adicionado ao carrinho!",
        description: `${quantity}x ${name} foram adicionados ao seu carrinho.`,
        duration: 3000,
      });
      openCart(); // Abrir o carrinho após adicionar
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

  return (
    <div className="px-4 mb-6">
      <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-product-title">{name}</h1>
      <p className="text-muted-foreground mb-3" data-testid="text-product-subtitle">{subtitle}</p>
      
      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex items-center mr-2" data-testid="rating-stars">
          {renderStars(rating)}
        </div>
        <span className="text-sm font-medium mr-1" data-testid="text-rating">{rating} de 5</span>
        <span className="text-sm text-muted-foreground" data-testid="text-review-count">({reviewCount})</span>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <div className="text-lg text-muted-foreground line-through mb-1" data-testid="text-original-price">
          R$ {originalPrice.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-3xl font-bold text-foreground mb-1" data-testid="text-current-price">
          R$ {currentPrice.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-sm text-muted-foreground" data-testid="text-installments">{installments}</div>
      </div>

      {/* Quantity and Buy Button */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" data-testid="label-quantity">Quantidade</label>
          <div className="flex items-center space-x-0">
            <button 
              className="quantity-button rounded-l-md" 
              onClick={decreaseQuantity}
              data-testid="button-decrease-quantity"
            >
              −
            </button>
            <input 
              type="number" 
              value={quantity} 
              min="1" 
              className="quantity-input border-l-0 border-r-0" 
              readOnly
              data-testid="input-quantity"
            />
            <button 
              className="quantity-button rounded-r-md" 
              onClick={increaseQuantity}
              data-testid="button-increase-quantity"
            >
              +
            </button>
          </div>
        </div>
        
        <button 
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50" 
          onClick={handleAddToCart}
          disabled={isAdding}
          data-testid="button-add-to-cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {isAdding ? "Adicionando..." : "Adicionar ao Carrinho"}
        </button>
      </div>
    </div>
  );
}
