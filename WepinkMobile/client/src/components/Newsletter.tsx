import { useState } from "react";

export default function Newsletter() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
    console.log('Newsletter signup:', formData);
  };

  return (
    <div className="w-full bg-[#ff0080] py-8 px-4 mb-0">
      <div className="max-w-md mx-auto">
        <h2 className="text-white text-lg font-bold text-center mb-6" data-testid="text-newsletter-title">
          receba dicas e novidades toda semana no seu e-mail
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text"
            name="name"
            placeholder="Nome *"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-500"
            data-testid="input-newsletter-name"
          />
          <input 
            type="tel"
            name="phone"
            placeholder="(11) 91111-1111*"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-500"
            data-testid="input-newsletter-phone"
          />
          <input 
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-500"
            data-testid="input-newsletter-email"
          />
          <button 
            type="submit"
            className="w-full bg-white text-[#ff0080] py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
            data-testid="button-newsletter-submit"
          >
            Enviar
          </button>
        </form>
        <p className="text-white text-xs text-center mt-4">
          protegido por <strong>reCAPTCHA</strong><br />
          <a href="#" className="underline">Privacidade</a> - <a href="#" className="underline">Termos</a>
        </p>
      </div>
    </div>
  );
}
