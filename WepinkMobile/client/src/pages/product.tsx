import Header from "@/components/Header";
import ProductCarousel from "@/components/ProductCarousel";
import ProductInfo from "@/components/ProductInfo";
import ProductTabs from "@/components/ProductTabs";
import CrossSell from "@/components/CrossSell";
import Newsletter from "@/components/Newsletter";
import ShoppingCart from "@/components/ShoppingCart";
import Footer from "@/components/Footer";
import PaymentFooter from "@/components/PaymentFooter";
import { MAIN_PRODUCT } from "@/data/products";

export default function ProductPage() {
  // Use unified product data
  const productData = {
    name: MAIN_PRODUCT.name,
    subtitle: 'que todos os seus sonhos sejam realizados!',
    rating: 4.5,
    reviewCount: 4901,
    originalPrice: parseFloat(MAIN_PRODUCT.originalPrice),
    currentPrice: parseFloat(MAIN_PRODUCT.currentPrice),
    installments: 'ou 6x R$ 15,81',
    images: MAIN_PRODUCT.images,
    description: 'O 4Dreams nasceu para celebrar 4 anos de história e conquistas da Wepink. Inspirado na força de sonhar grande, ele traduz esse sentimento em notas que unem frescor, elegância e intensidade. A abertura traz a energia vibrante da tangerina e das frutas vermelhas, que se encontram com um coração floral marcante de rosa, jasmim e mimosa. No fundo, a sofisticação do patchouli e do cedro se mistura ao calor do musk e à doçura suave da baunilha, criando uma assinatura única. 4Dreams é mais que uma fragrância: é um lembrete de que cada conquista começa com um sonho!',
    notes: 'Saída: Tangerina e Frutas vermelhas. Corpo: Rosa, Jasmim e Mimosa. Fundo: Patchouli, Cedro, Musk e Baunilha.',
    usage: 'Aplique o desodorante colônia nas áreas de pulsação, como pulsos, pescoço e atrás das orelhas.',
    characteristics: [
      'Caminho olfativo: Chypre Floral',
      'Essência sofisticada, intensa e envolvente',
      'Fixação e projeção prolongadas',
      'Excelência em cada detalhe'
    ]
  };

  return (
    <div className="bg-background font-sans">
      <Header />

      {/* Breadcrumb */}
      <nav className="px-4 py-2 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground" data-testid="link-breadcrumb-perfumaria">Perfumaria</a> &gt; 
        <a href="#" className="hover:text-foreground" data-testid="link-breadcrumb-unissex"> Unissex</a> &gt; 
        <span className="text-foreground"> {productData.name}</span>
      </nav>

      <ProductCarousel images={productData.images} productName={productData.name} />

      <ProductInfo
        productId={MAIN_PRODUCT.id}
        name={productData.name}
        subtitle={productData.subtitle}
        rating={productData.rating}
        reviewCount={productData.reviewCount}
        originalPrice={productData.originalPrice}
        currentPrice={productData.currentPrice}
        installments={productData.installments}
      />

      {/* Características Section */}
      <div className="characteristics-section w-full py-6 px-4 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white" data-testid="text-characteristics-title">Características</h2>
        <ul className="space-y-2">
          {productData.characteristics.map((char, index) => (
            <li key={index} className="flex items-start text-white" data-testid={`characteristic-${index}`}>
              <span className="mr-2">•</span>
              <span><strong>{char}</strong></span>
            </li>
          ))}
        </ul>
      </div>

      <ProductTabs
        description={productData.description}
        notes={productData.notes}
        usage={productData.usage}
      />

      <CrossSell />

      <Newsletter />
      
      <ShoppingCart />
      
      <Footer />
      
      <PaymentFooter />
    </div>
  );
}
