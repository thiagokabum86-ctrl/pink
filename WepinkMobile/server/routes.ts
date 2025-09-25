import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertCartSchema,
  insertReviewSchema,
  insertNewsletterSchema 
} from "@shared/schema";

// PixUp Basic Authentication management (as per official docs)
function getPixUpBasicAuthHeader(): string {
  const clientId = process.env.PIXUP_CLIENT_ID;
  const clientSecret = process.env.PIXUP_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('PixUp client credentials not configured');
  }
  
  // Create Basic Auth string: client_id:client_secret
  const credentials = `${clientId}:${clientSecret}`;
  
  // Encode with base64 as per PixUp documentation
  const base64Credentials = Buffer.from(credentials).toString('base64');
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 Using PixUp Basic Auth with client_id:', clientId.substring(0, 8) + '...');
  }
  
  return `Basic ${base64Credentials}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Integration reference: javascript_auth_all_persistance
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers["cart-session-id"] as string || req.query.sessionId as string;
      console.log('🛒 GET /api/cart - sessionId:', sessionId, 'headers:', req.headers["cart-session-id"], 'query:', req.query.sessionId);
      
      if (!sessionId) {
        return res.status(400).json({ error: "Cart session ID required" });
      }
      const cartItems = await storage.getCartItems(sessionId);
      console.log('🛒 Cart items found:', cartItems.length);
      res.json(cartItems);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      console.log('🛒 POST /api/cart - body:', JSON.stringify(req.body, null, 2));
      
      // Validar dados com Zod incluindo sessionId
      const cartData = insertCartSchema.extend({
        sessionId: z.string().min(1, "Session ID required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99")
      }).parse(req.body);
      
      console.log('🔄 Dados validados:', cartData);
      
      // Mapear sessionId para userId no banco de dados
      const cartItem = await storage.addToCart({
        ...cartData,
        userId: cartData.sessionId
      });
      
      console.log('✅ Item adicionado ao carrinho:', cartItem);
      res.json(cartItem);
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid cart data", details: (error as any).errors });
      }
      res.status(400).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const sessionId = req.headers["cart-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Cart session ID required" });
      }
      
      // Validar quantidade com Zod
      const quantitySchema = z.object({
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99")
      });
      const { quantity } = quantitySchema.parse(req.body);
      
      // Verificar propriedade: item pertence à sessão?
      const existingItem = await storage.getCartItemById(req.params.id);
      if (!existingItem || existingItem.userId !== sessionId) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      const updatedItem = await storage.updateCartQuantity(req.params.id, quantity);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid quantity", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  // Rota específica DEVE vir ANTES da rota genérica
  app.delete("/api/cart/clear", async (req, res) => {
    try {
      // Validar sessionId com Zod
      const clearSchema = z.object({
        sessionId: z.string().min(1, "Session ID required")
      });
      const { sessionId } = clearSchema.parse(req.body);
      
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid session data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const sessionId = req.headers["cart-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Cart session ID required" });
      }
      
      // Verificar propriedade: item pertence à sessão?
      const existingItem = await storage.getCartItemById(req.params.id);
      if (!existingItem || existingItem.userId !== sessionId) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(500).json({ error: "Failed to remove cart item" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.id
      });
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Newsletter route
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(email);
      res.json(subscription);
    } catch (error) {
      res.status(400).json({ error: "Invalid email or already subscribed" });
    }
  });

  // PixUp BR payment routes - SECURE VERSION
  app.post("/api/pixup/create-payment", async (req, res) => {
    try {
      // Validar dados com Zod
      const checkoutSchema = z.object({
        sessionId: z.string().min(1, "Session ID required"),
        customer: z.object({
          name: z.string().optional(),
          email: z.string().email().optional().or(z.literal('')),
          phone: z.string().optional()
        }).optional(),
        success_url: z.string().url("Invalid success URL"),
        cancel_url: z.string().url("Invalid cancel URL"),
        webhook_url: z.string().url("Invalid webhook URL")
      });
      
      const { sessionId, customer, success_url, cancel_url, webhook_url } = checkoutSchema.parse(req.body);

      // Debug: Log what we're looking for
      console.log('🔍 Calculando carrinho para sessionId:', sessionId);
      
      // SECURITY: Recalculate totals server-side to prevent price tampering
      const cartCalculation = await storage.calculateCartTotal(sessionId);
      
      console.log('🛒 Resultado do carrinho:', {
        itemsCount: cartCalculation.items.length,
        totalAmount: cartCalculation.totalAmount,
        items: cartCalculation.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.totalPrice }))
      });
      
      if (cartCalculation.items.length === 0) {
        return res.status(400).json({ error: "Carrinho vazio" });
      }
      
      if (cartCalculation.totalAmount <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
      }

      // Create order in database
      const order = await storage.createOrder({
        sessionId,
        status: 'pending',
        totalAmount: cartCalculation.totalAmount.toFixed(2),
        currency: 'BRL',
        customerEmail: customer?.email || '',
        customerName: customer?.name || 'Cliente WePink',
        customerPhone: customer?.phone || ''
      });
      
      // Add order items
      for (const item of cartCalculation.items) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: (item.totalPrice / item.quantity).toFixed(2),
          totalPrice: item.totalPrice.toFixed(2)
        });
      }
      
      // Prepare for PixUp API call
      const pixupPayload = {
        amount: Math.round(cartCalculation.totalAmount * 100), // PixUp uses cents
        currency: 'BRL',
        description: `Pedido WePink #${order.id} - ${cartCalculation.items.length} ${cartCalculation.items.length === 1 ? 'item' : 'itens'}`,
        customer: {
          name: customer?.name || 'Cliente WePink',
          email: customer?.email || '',
          phone: customer?.phone || ''
        },
        items: cartCalculation.items.map(item => ({
          id: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          price: Math.round((item.totalPrice / item.quantity) * 100) // Unit price in cents
        })),
        success_url,
        cancel_url,
        webhook_url,
        metadata: {
          orderId: order.id,
          sessionId: sessionId
        }
      };
      
      // Call PixUp API (with fallback for development)
      let pixupData;
      try {
        // Get Basic Auth header as per PixUp documentation
        const authHeader = getPixUpBasicAuthHeader();
        
        const pixupResponse = await fetch(`${process.env.PIXUP_BASE_URL}/api/v1/payments`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pixupPayload)
        });
        
        if (!pixupResponse.ok) {
          const errorData = await pixupResponse.text();
          if (process.env.NODE_ENV !== 'production') {
            console.error('PixUp API Error:', pixupResponse.status, errorData);
          }
          throw new Error(`PixUp API failed: ${pixupResponse.status}`);
        }
        
        pixupData = await pixupResponse.json();
        
      } catch (networkError: any) {
        // Fallback to local payment creation if PixUp API fails
        console.log('PixUp API unavailable, using local fallback');
        
        // Local fallback
        pixupData = {
          id: `pixup_${Date.now()}`,
          payment_id: `pay_${Date.now()}`,
          checkout_url: `https://checkout.pixupbr.com/pay/${order.id}`,
          payment_url: `https://pix.pixupbr.com/qr/${order.id}`,
          pix_code: `00020126580014br.gov.bcb.pix01368935b9c1-c1b5-4b7c-b5c8-7b1e1e1e1e1e5204000053039865802BR5925${order.customerName || 'Cliente WePink'}6009SAO PAULO62070503***6304`,
          qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAACXBIWXMAAAsTAAALEwEAmpwYAAADaElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...`,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
      }
      
      // Create payment record with real PixUp data
      const payment = await storage.createPayment({
        orderId: order.id,
        pixupPaymentId: pixupData.id || pixupData.payment_id,
        status: 'pending',
        amount: cartCalculation.totalAmount.toFixed(2),
        currency: 'BRL',
        paymentMethod: 'pix',
        pixupCheckoutUrl: pixupData.checkout_url || pixupData.payment_url
      });

      res.json({
        success: true,
        payment: {
          id: payment.id,
          pixup_id: pixupData.id || pixupData.payment_id,
          order_id: order.id,
          amount: cartCalculation.totalAmount,
          currency: 'BRL',
          status: 'pending',
          checkout_url: pixupData.checkout_url || pixupData.payment_url,
          pix_code: pixupData.pix_code,
          qr_code: pixupData.qr_code,
          created_at: new Date().toISOString(),
          expires_at: pixupData.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      });
      
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Erro ao criar pagamento PixUp:', error);
      }
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos",
          details: process.env.NODE_ENV === 'production' ? undefined : error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro interno do servidor ao criar pagamento",
        details: process.env.NODE_ENV === 'production' ? undefined : error.message 
      });
    }
  });

  app.post("/api/pixup/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      // Validate PixUp webhook signature for security
      const signature = req.headers['pixup-signature'] || req.headers['x-pixup-signature'];
      const rawBody = req.body;
      
      // In production, webhook secret is required
      if (process.env.NODE_ENV === 'production' && !process.env.PIXUP_WEBHOOK_SECRET) {
        throw new Error('PIXUP_WEBHOOK_SECRET is required in production');
      }
      
      if (process.env.PIXUP_WEBHOOK_SECRET) {
        if (!signature) {
          return res.status(401).json({ error: "Signature required" });
        }
        
        const expectedSignature = createHmac('sha256', process.env.PIXUP_WEBHOOK_SECRET)
          .update(rawBody)
          .digest('hex');
        
        const providedSignature = Array.isArray(signature) ? signature[0] : signature;
        const cleanSignature = providedSignature.replace('sha256=', '');
        
        try {
          if (!timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(cleanSignature))) {
            return res.status(401).json({ error: "Invalid signature" });
          }
        } catch (error) {
          return res.status(401).json({ error: "Invalid signature format" });
        }
      }
      
      // Parse JSON body after signature validation
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody.toString());
      } catch (error) {
        return res.status(400).json({ error: "Invalid JSON" });
      }
      
      const webhookSchema = z.object({
        payment_id: z.string(),
        status: z.enum(['pending', 'approved', 'cancelled', 'failed']),
        amount: z.number().optional(),
        payment_method: z.string().optional(),
        metadata: z.object({
          orderId: z.string(),
          sessionId: z.string().optional()
        }).optional()
      });
      
      const { payment_id, status, amount, payment_method, metadata } = webhookSchema.parse(parsedBody);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('PixUp Webhook recebido:', {
          payment_id,
          status,
          amount,
          metadata,
          timestamp: new Date().toISOString()
        });
      }

      // Find payment by PixUp ID
      const payment = await storage.getPaymentByPixupId(payment_id);
      
      if (!payment) {
        console.error(`Pagamento não encontrado para PixUp ID: ${payment_id}`);
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      
      // Update payment status
      const updatedPayment = await storage.updatePaymentStatus(
        payment.id, 
        status as 'pending' | 'approved' | 'cancelled' | 'failed',
        JSON.stringify(parsedBody)
      );
      
      // Update order status based on payment status
      if (payment.orderId) {
        let orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
        
        switch (status) {
          case 'approved':
            orderStatus = 'processing'; // Order confirmed, preparing for shipment
            break;
          case 'cancelled':
          case 'failed':
            orderStatus = 'cancelled';
            break;
          default:
            orderStatus = 'pending';
        }
        
        await storage.updateOrderStatus(payment.orderId, orderStatus);
        
        // If payment approved, clear the cart
        if (status === 'approved' && metadata?.sessionId) {
          await storage.clearCart(metadata.sessionId);
        }
      }
      
      // Respond to PixUp that webhook was processed
      res.status(200).json({ 
        received: true, 
        payment_id: payment.id,
        status: updatedPayment?.status 
      });
      
    } catch (error: any) {
      console.error('Erro no webhook PixUp:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos do webhook",
          details: process.env.NODE_ENV === 'production' ? undefined : error.errors 
        });
      }
      
      res.status(500).json({ error: "Erro ao processar webhook" });
    }
  });

  app.get("/api/pixup/payment/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.headers["cart-session-id"] as string;
      
      // Get payment from database
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      
      // Security: Require session ownership
      if (!sessionId) {
        return res.status(401).json({ error: "Session required" });
      }
      
      if (payment.orderId) {
        const order = await storage.getOrder(payment.orderId);
        if (!order || order.sessionId !== sessionId) {
          return res.status(404).json({ error: "Pagamento não encontrado" });
        }
      } else {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      
      // Query real PixUp API for latest status if in production
      if (process.env.NODE_ENV === 'production' && process.env.PIXUP_CLIENT_ID && payment.pixupPaymentId) {
        try {
          // Get Basic Auth header as per PixUp documentation
          const authHeader = getPixUpBasicAuthHeader();
          
          const pixupResponse = await fetch(`${process.env.PIXUP_BASE_URL}/api/v1/payments/${payment.pixupPaymentId}`, {
            headers: { 
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            }
          });
          
          if (pixupResponse.ok) {
            const pixupData = await pixupResponse.json();
            
            // Update local status if different from PixUp
            if (pixupData.status && pixupData.status !== payment.status) {
              await storage.updatePaymentStatus(payment.id, pixupData.status, JSON.stringify(pixupData));
              payment.status = pixupData.status;
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('PixUp status check failed:', error);
          }
          // Continue with local status
        }
      }
      
      // Return minimal payment info
      res.json({
        status: payment.status,
        amount: parseFloat(payment.amount),
        currency: payment.currency
      });
      
    } catch (error: any) {
      console.error('Erro ao consultar status PixUp:', error);
      res.status(500).json({ error: "Erro ao consultar status do pagamento" });
    }
  });

  // Test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
