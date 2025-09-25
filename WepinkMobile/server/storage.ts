// Integration reference: javascript_auth_all_persistance
import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Cart,
  type InsertCart,
  type Review,
  type InsertReview,
  type Newsletter,
  type InsertNewsletter,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Payment,
  type InsertPayment
} from "@shared/schema";
import { db } from "./db";
import { users, products, cart, reviews, newsletter, orders, orderItems, payments } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session, { SessionData, Store } from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart methods
  getCartItems(userId?: string): Promise<Cart[]>;
  getCartItemById(id: string): Promise<Cart | undefined>;
  addToCart(cartItem: InsertCart): Promise<Cart>;
  updateCartQuantity(id: string, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId?: string): Promise<void>;
  
  // Review methods
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Newsletter methods
  subscribeToNewsletter(email: string): Promise<Newsletter>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'cancelled'): Promise<Order | undefined>;
  
  // Order items methods
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByPixupId(pixupPaymentId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: 'pending' | 'approved' | 'cancelled' | 'failed' | 'refunded', webhookData?: string): Promise<Payment | undefined>;
  
  // Cart calculation for security
  calculateCartTotal(sessionId: string): Promise<{ items: Array<{productId: string, quantity: number, product: Product, totalPrice: number}>, totalAmount: number }>;

  // Session store for authentication
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    // Use environment variable for database connection
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL!,
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  // Cart methods
  async getCartItems(userId?: string): Promise<Cart[]> {
    if (!userId) return [];
    return await db.select().from(cart).where(eq(cart.userId, userId));
  }

  async getCartItemById(id: string): Promise<Cart | undefined> {
    const [item] = await db.select().from(cart).where(eq(cart.id, id));
    return item || undefined;
  }

  async addToCart(cartItem: InsertCart): Promise<Cart> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cart)
      .where(
        and(
          eq(cart.userId, cartItem.userId || ""),
          eq(cart.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cart)
        .set({ quantity: existingItem.quantity + (cartItem.quantity || 1) })
        .where(eq(cart.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cart)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async updateCartQuantity(id: string, quantity: number): Promise<Cart | undefined> {
    const [updatedItem] = await db
      .update(cart)
      .set({ quantity })
      .where(eq(cart.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cart).where(eq(cart.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(userId?: string): Promise<void> {
    if (userId) {
      await db.delete(cart).where(eq(cart.userId, userId));
    }
  }

  // Review methods
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    const [subscription] = await db
      .insert(newsletter)
      .values({ email })
      .returning();
    return subscription;
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async updateOrderStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'cancelled'): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  // Order items methods
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return item;
  }
  
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }
  
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }
  
  async getPaymentByPixupId(pixupPaymentId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.pixupPaymentId, pixupPaymentId));
    return payment || undefined;
  }
  
  async updatePaymentStatus(id: string, status: 'pending' | 'approved' | 'cancelled' | 'failed' | 'refunded', webhookData?: string): Promise<Payment | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (webhookData) {
      updateData.webhookData = webhookData;
    }
    
    const [updatedPayment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }
  
  // Cart calculation for security - recalculate totals server-side
  async calculateCartTotal(sessionId: string): Promise<{ items: Array<{productId: string, quantity: number, product: Product, totalPrice: number}>, totalAmount: number }> {
    // Get cart items for session
    const cartItems = await db
      .select({
        id: cart.id,
        productId: cart.productId,
        quantity: cart.quantity,
        product: products
      })
      .from(cart)
      .innerJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, sessionId));
    
    let totalAmount = 0;
    const items = cartItems.map(item => {
      const unitPrice = parseFloat(item.product.price);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        totalPrice: totalPrice
      };
    });
    
    return { items, totalAmount };
  }
}

export const storage = new DatabaseStorage();
