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
  isPaid: boolean("is_paid").notNull().default(false), // Đã được trả lại hay chưa
  paymentDate: timestamp("payment_date"), // Ngày được trả lại
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

// Payment history table to track all payments
export const paymentHistory = pgTable("payment_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  settlementId: uuid("settlement_id").notNull().references(() => settlements.id, { onDelete: "cascade" }),
  payerId: varchar("payer_id").notNull().references(() => users.id),
  payeeId: varchar("payee_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("bank_transfer"),
  status: varchar("status", { length: 20 }).default("completed"),
  description: text("description"),
  paymentProofUrl: text("payment_proof_url"),
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Paid expenses table to link expenses covered by payments
export const paidExpenses = pgTable("paid_expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentHistoryId: uuid("payment_history_id").notNull().references(() => paymentHistory.id, { onDelete: "cascade" }),
  expenseId: uuid("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  paidExpenses: many(expenses, { relationName: "payer" }),
  paidSettlements: many(settlements, { relationName: "payer" }),
  receivedSettlements: many(settlements, { relationName: "payee" }),
  paymentsSent: many(paymentHistory, { relationName: "payer" }),
  paymentsReceived: many(paymentHistory, { relationName: "payee" }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  payer: one(users, {
    fields: [expenses.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  paidExpenses: many(paidExpenses),
}));

export const settlementsRelations = relations(settlements, ({ one, many }) => ({
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
  paymentHistory: many(paymentHistory),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one, many }) => ({
  settlement: one(settlements, {
    fields: [paymentHistory.settlementId],
    references: [settlements.id],
  }),
  payer: one(users, {
    fields: [paymentHistory.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [paymentHistory.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
  paidExpenses: many(paidExpenses),
}));

export const paidExpensesRelations = relations(paidExpenses, ({ one }) => ({
  paymentHistory: one(paymentHistory, {
    fields: [paidExpenses.paymentHistoryId],
    references: [paymentHistory.id],
  }),
  expense: one(expenses, {
    fields: [paidExpenses.expenseId],
    references: [expenses.id],
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

// Payment history schemas
export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  payerId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().min(1, "Amount is required").transform((val) => parseFloat(val)),
  paymentMethod: z.enum(["bank_transfer", "cash", "digital_wallet"]).default("bank_transfer"),
  status: z.enum(["pending", "completed", "failed"]).default("completed"),
  expenseIds: z.array(z.string()).optional(), // Array of expense IDs to mark as paid
});

export const insertPaidExpenseSchema = createInsertSchema(paidExpenses).omit({
  id: true,
  createdAt: true,
}).extend({
  amountPaid: z.string().min(1, "Amount paid is required").transform((val) => parseFloat(val)),
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
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type PaidExpense = typeof paidExpenses.$inferSelect;
export type InsertPaidExpense = z.infer<typeof insertPaidExpenseSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
