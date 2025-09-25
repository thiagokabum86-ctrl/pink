import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#ff0080] py-6 px-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo */}
        <div className="text-white font-bold text-2xl" data-testid="footer-logo">
          wepink
        </div>
        
        {/* Social Media Icons */}
        <div className="flex space-x-4" data-testid="social-media-icons">
          <a 
            href="https://instagram.com/wepink" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="link-instagram"
            aria-label="Instagram"
          >
            <Instagram size={20} className="text-[#ff0080]" />
          </a>
          
          <a 
            href="https://facebook.com/wepink" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="link-facebook"
            aria-label="Facebook"
          >
            <Facebook size={20} className="text-[#ff0080]" />
          </a>
          
          <a 
            href="https://youtube.com/wepink" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-white hover:opacity-90 transition-opacity"
            data-testid="link-youtube"
            aria-label="YouTube"
            style={{ backgroundColor: 'white' }}
          >
            <Youtube size={20} className="text-[#ff0080]" />
          </a>
        </div>
      </div>
    </footer>
  );
}