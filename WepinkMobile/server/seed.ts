import { db } from "./db";
import { products } from "@shared/schema";
import type { InsertProduct } from "@shared/schema";

const vfBloomProduct: InsertProduct = {
  name: "VF Bloom Desodorante Colônia 75ml - Wepink",
  subtitle: "a beleza no sutil florescer do aroma",
  description: `O <strong>VF Bloom Desodorante Colônia</strong> é uma ode à delicadeza feminina com toques de sensualidade e elegância, que exalta o amor à vida como uma bela primavera. Seu aroma personifica uma aura jovem e encantadora, com um sorriso vibrante e sofisticado.
    <br><br>
    Sua experiência olfativa é única e suave, começa com a captura da alegria em um mix de frutas, em uma explosão cítrica da bergamota e toranja, misturada com a suculência do pêssego e a delicadeza do coco. No coração, uma harmonia floral abraça um lado romântico e elegante. Seguindo para um fundo doce e amadeirado trazendo conforto com um toque sensual.`,
  price: "94.90",
  originalPrice: "329.00",
  rating: "4.5",
  reviewCount: 4901,
  images: [
    "https://wepink.vtexassets.com/arquivos/ids/160550-800-auto?v=638822664318700000&width=800&height=auto&aspect=true",
    "https://wepink.vtexassets.com/arquivos/ids/160551-800-auto?v=638822664318700000&width=800&height=auto&aspect=true",
    "https://wepink.vtexassets.com/arquivos/ids/160552-800-auto?v=638822664318700000&width=800&height=auto&aspect=true",
    "https://wepink.vtexassets.com/arquivos/ids/160553-800-auto?v=638822664318700000&width=800&height=auto&aspect=true",
    "https://wepink.vtexassets.com/arquivos/ids/160554-800-auto?v=638822664318700000&width=800&height=auto&aspect=true"
  ],
  category: "perfumaria",
  brand: "WePink",
  characteristics: [
    "Caminho olfativo: Floral Frutado",
    "Essência fresca e envolvente", 
    "Qualidade incrível",
    "Longa duração"
  ],
  notes: "Bergamota, Toranja, Pêssego, Coco, Harmonia floral, Fundo doce e amadeirado",
  usage: "Aplique o desodorante colônia nas áreas de pulsação, como pulsos, pescoço e atrás das orelhas. Para melhor fixação, aplique após o banho na pele limpa e seca. Mantenha uma distância de aproximadamente 15cm da pele durante a aplicação.",
  installments: "ou 6x R$ 15,81"
};

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Check if product already exists
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length === 0) {
      // Insert the VF Bloom product
      const [insertedProduct] = await db
        .insert(products)
        .values(vfBloomProduct)
        .returning();
      
      console.log("✅ VF Bloom product seeded successfully:", insertedProduct.id);
    } else {
      console.log("✅ Database already contains products, skipping seed");
    }
    
    console.log("Seed completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase();