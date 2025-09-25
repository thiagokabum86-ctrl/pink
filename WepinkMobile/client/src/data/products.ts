// Unified product catalog for static site
export interface StaticProduct {
  id: string;
  name: string;
  currentPrice: string;
  originalPrice: string;
  images: string[];
}

export const PRODUCT_CATALOG: StaticProduct[] = [
  {
    id: '4dreams-perfume',
    name: '4Dreams Desodorante Colônia 75ml - Wepink',
    currentPrice: '94.90',
    originalPrice: '329.00',
    images: [
      'https://wepink.vtexassets.com/arquivos/ids/161360/2.png?v=638938120844300000',
      'https://wepink.vtexassets.com/arquivos/ids/161361/4.png?v=638938120844430000',
      'https://wepink.vtexassets.com/arquivos/ids/161362/3.png?v=638938120844430000',
      'https://wepink.vtexassets.com/arquivos/ids/161363/1.png?v=638938120844430000',
      'https://wepink.vtexassets.com/arquivos/ids/161364/5.png?v=638938120844600000'
    ]
  },
  {
    id: 'vf-onyx',
    name: 'VF Onyx Desodorante Colônia 75ml - Wepink',
    currentPrice: '94.90', 
    originalPrice: '169.90',
    images: ['https://wepink.vtexassets.com/arquivos/ids/161279/3.png?v=638922763153000000']
  }
];

// Helper to get product by ID
export const getProductById = (id: string): StaticProduct | undefined => {
  return PRODUCT_CATALOG.find(product => product.id === id);
};

// Main product for the page
export const MAIN_PRODUCT = PRODUCT_CATALOG[0]; // 4Dreams

// Cross-sell products
export const CROSS_SELL_PRODUCTS = PRODUCT_CATALOG.slice(1); // VF Bloom