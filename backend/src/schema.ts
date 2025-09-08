import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  numeric,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // Thêm field cho password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  payerId: varchar("payer_id").notNull().references(() => users.id),
  isShared: boolean("is_shared").notNull().default(true),
  isSettled: boolean("is_settled").notNull().default(false), // Đã được thanh toán hay chưa
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settlements table (for tracking payments between users)
export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  payerId: varchar("payer_id").notNull().references(() => users.id),
  payeeId: varchar("payee_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"), // Bank transfer receipt
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  paidExpenses: many(expenses, { relationName: "payer" }),
  paidSettlements: many(settlements, { relationName: "payer" }),
  receivedSettlements: many(settlements, { relationName: "payee" }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  payer: one(users, {
    fields: [expenses.payerId],
    references: [users.id],
    relationName: "payer",
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  payer: one(users, {
    fields: [settlements.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [settlements.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
}));

// Zod schemas for validation
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  payerId: true,
  isSettled: true, // Không cho phép client set isSettled khi tạo mới
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().min(1, "Amount is required").transform((val) => parseFloat(val)),
});

export const updateExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  payerId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().min(1, "Amount is required").transform((val) => parseFloat(val)),
}).partial(); // Tất cả fields đều optional cho update

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  payerId: true,
  createdAt: true,
}).extend({
  amount: z.string().min(1, "Amount is required").transform((val) => parseFloat(val)),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
