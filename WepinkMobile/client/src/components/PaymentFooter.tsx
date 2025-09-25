import { ArrowUp } from "lucide-react";
import visaLogo from "@assets/visa___43536123f164a028d239418ceee07be6_1758761909068.png";
import mastercardLogo from "@assets/mastercard___11aa07ff37aabcfd7d5272c92d6ad813_1758761909066.png";
import dinersLogo from "@assets/diners-club___43de54bcf5ac968e7567a674ab0d8d1c_1758761909071.png";
import amexLogo from "@assets/amex___0b9da747297f343e136144a34cdc014e_1758761909069.png";
import pixLogo from "@assets/pix___5ca4a25f029f79325afd12bc5598f602_1758761909067.png";

export default function PaymentFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full bg-[#ff0080] py-8 px-4 text-white">
      <div className="max-w-md mx-auto text-center">
        {/* Payment Methods Title */}
        <h3 className="text-lg font-semibold mb-6" data-testid="payment-title">
          Formas de pagamento
        </h3>
        
        {/* Credit Card Icons - Using PNG Images */}
        <div className="flex justify-center space-x-3 mb-6" data-testid="payment-cards">
          {/* VISA */}
          <div className="w-12 h-8 flex items-center justify-center">
            <img 
              src={visaLogo} 
              alt="Visa" 
              className="w-12 h-6 object-contain"
              data-testid="logo-visa"
            />
          </div>
          
          {/* Mastercard */}
          <div className="w-12 h-8 flex items-center justify-center">
            <img 
              src={mastercardLogo} 
              alt="Mastercard" 
              className="w-12 h-6 object-contain"
              data-testid="logo-mastercard"
            />
          </div>
          
          {/* Diners */}
          <div className="w-12 h-8 flex items-center justify-center">
            <img 
              src={dinersLogo} 
              alt="Diners Club" 
              className="w-12 h-6 object-contain"
              data-testid="logo-diners"
            />
          </div>
          
          {/* AMEX */}
          <div className="w-12 h-8 flex items-center justify-center">
            <img 
              src={amexLogo} 
              alt="American Express" 
              className="w-12 h-6 object-contain"
              data-testid="logo-amex"
            />
          </div>
        </div>
        
        {/* PIX - Using PNG Image */}
        <div className="mb-6" data-testid="pix-section">
          <div className="inline-flex flex-col items-center">
            <div className="mb-2">
              <img 
                src={pixLogo} 
                alt="PIX" 
                className="w-6 h-6 object-contain"
                data-testid="logo-pix"
              />
            </div>
            <div className="text-sm font-medium">Pix</div>
          </div>
        </div>
        
        {/* Back to Top Button */}
        <button 
          onClick={scrollToTop}
          className="inline-flex items-center space-x-2 mb-6 hover:opacity-80 transition-opacity"
          data-testid="back-to-top-button"
          aria-label="Voltar ao topo"
        >
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <ArrowUp size={16} className="text-white" />
          </div>
          <span className="text-sm">voltar ao topo</span>
        </button>
        
        {/* Legal Links */}
        <div className="flex justify-center space-x-4 text-sm" data-testid="legal-links">
          <a 
            href="#privacy" 
            className="hover:underline"
            data-testid="link-privacy-policy"
          >
            Política de Privacidade
          </a>
          <span>|</span>
          <a 
            href="#terms" 
            className="hover:underline"
            data-testid="link-terms-of-use"
          >
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
}