import { Router, Request, Response } from 'express';
import { eq, desc, inArray, and } from 'drizzle-orm';
import { db } from '../db.js';
import { 
  settlements, 
  insertSettlementSchema, 
  paymentHistory, 
  insertPaymentHistorySchema,
  paidExpenses,
  expenses,
  users
} from '../schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All settlement routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/settlements:
 *   get:
 *     summary: Get all settlements
 *     description: Retrieve all settlements in the system
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of settlements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettlementsListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get all settlements
router.get('/', async (req: Request, res: Response) => {
  try {
    const allSettlements = await db
      .select()
      .from(settlements)
      .orderBy(desc(settlements.createdAt));
    
    res.json({ settlements: allSettlements });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Create new settlement
 *     description: Create a new settlement record for payment between users
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSettlementRequest'
 *     responses:
 *       201:
 *         description: Settlement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettlementResponse'
 *       400:
 *         description: Invalid settlement data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Create new settlement with payment history
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const validatedData = insertSettlementSchema.parse(req.body);
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create settlement
      const [newSettlement] = await tx
        .insert(settlements)
        .values({
          ...validatedData,
          amount: validatedData.amount.toString(),
          payerId: userId,
        })
        .returning();
      
      // Create payment history record
      const [newPaymentHistory] = await tx
        .insert(paymentHistory)
        .values({
          settlementId: newSettlement.id,
          payerId: userId,
          payeeId: validatedData.payeeId,
          amount: validatedData.amount.toString(),
          paymentMethod: req.body.paymentMethod || 'bank_transfer',
          status: 'completed',
          description: validatedData.description,
          paymentProofUrl: validatedData.imageUrl,
        })
        .returning();
      
      // If expense IDs are provided, mark them as paid
      if (req.body.expenseIds && Array.isArray(req.body.expenseIds)) {
        const expenseIds = req.body.expenseIds;
        
        // Get expenses that should be marked as paid
        const expensesToPay = await tx
          .select()
          .from(expenses)
          .where(and(
            inArray(expenses.id, expenseIds),
            eq(expenses.isPaid, false)
          ));
        
        if (expensesToPay.length > 0) {
          // Create paid_expenses records
          const paidExpensesRecords = expensesToPay.map(expense => ({
            paymentHistoryId: newPaymentHistory.id,
            expenseId: expense.id,
            amountPaid: expense.amount.toString(),
          }));
          
          await tx.insert(paidExpenses).values(paidExpensesRecords);
          
          // Mark expenses as paid
          await tx
            .update(expenses)
            .set({ 
              isPaid: true, 
              paymentDate: new Date(),
              isSettled: true 
            })
            .where(inArray(expenses.id, expenseIds));
        }
      }
      
      return { settlement: newSettlement, paymentHistory: newPaymentHistory };
    });
    
    res.status(201).json({ 
      message: 'Settlement and payment recorded successfully',
      ...result
    });
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(400).json({ error: 'Invalid settlement data' });
  }
});

/**
 * @swagger
 * /api/settlements/payment-history:
 *   get:
 *     summary: Get payment history
 *     description: Retrieve all payment history records
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payment history
 */
// Get payment history
router.get('/payment-history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const paymentHistoryRecords = await db
      .select({
        id: paymentHistory.id,
        settlementId: paymentHistory.settlementId,
        amount: paymentHistory.amount,
        paymentMethod: paymentHistory.paymentMethod,
        status: paymentHistory.status,
        description: paymentHistory.description,
        paymentProofUrl: paymentHistory.paymentProofUrl,
        paymentDate: paymentHistory.paymentDate,
        createdAt: paymentHistory.createdAt,
        payer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        payee: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(paymentHistory)
      .leftJoin(users, eq(paymentHistory.payerId, users.id))
      .leftJoin(users, eq(paymentHistory.payeeId, users.id))
      .where(eq(paymentHistory.payerId, userId))
      .orderBy(desc(paymentHistory.paymentDate));
    
    res.json({ paymentHistory: paymentHistoryRecords });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

/**
 * @swagger
 * /api/settlements/payment-history/{id}:
 *   get:
 *     summary: Get payment history details
 *     description: Get detailed information about a specific payment including paid expenses
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 */
// Get payment history details with paid expenses
router.get('/payment-history/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const paymentId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get payment history details
    const [paymentDetails] = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.id, paymentId));
    
    if (!paymentDetails) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Get associated paid expenses
    const paidExpensesDetails = await db
      .select({
        id: paidExpenses.id,
        amountPaid: paidExpenses.amountPaid,
        expense: {
          id: expenses.id,
          title: expenses.title,
          amount: expenses.amount,
          description: expenses.description,
          createdAt: expenses.createdAt,
        }
      })
      .from(paidExpenses)
      .leftJoin(expenses, eq(paidExpenses.expenseId, expenses.id))
      .where(eq(paidExpenses.paymentHistoryId, paymentId));
    
    res.json({
      payment: paymentDetails,
      paidExpenses: paidExpensesDetails
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

export default router;
