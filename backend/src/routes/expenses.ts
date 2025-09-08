import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db.js';
import { expenses, insertExpenseSchema, updateExpenseSchema, users } from '../schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All expense routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     description: Retrieve all expenses in the system
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpensesListResponse'
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
// Get all expenses
router.get('/', async (req: Request, res: Response) => {
  try {
    const allExpenses = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        description: expenses.description,
        payerId: expenses.payerId,
        isShared: expenses.isShared,
        isSettled: expenses.isSettled,
        imageUrl: expenses.imageUrl,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        payerFirstName: users.firstName,
        payerLastName: users.lastName,
        payerEmail: users.email,
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.payerId, users.id))
      .orderBy(desc(expenses.createdAt));
    
    res.json({ expenses: allExpenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create new expense
 *     description: Create a new expense record
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseRequest'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         description: Invalid expense data
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
// Create new expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const validatedData = insertExpenseSchema.parse(req.body);
    
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...validatedData,
        amount: validatedData.amount.toString(),
        payerId: userId,
      })
      .returning();
    
    res.status(201).json({ 
      message: 'Expense created successfully',
      expense: newExpense 
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(400).json({ error: 'Invalid expense data' });
  }
});

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     description: Update an existing expense (only by the payer)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseRequest'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         description: Invalid expense data
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
 *       403:
 *         description: Not authorized to update this expense
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Update expense
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const validatedData = updateExpenseSchema.parse(req.body);
    
    // Check if expense exists and user is the payer
    const [existingExpense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    if (existingExpense.payerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this expense' });
    }
    
    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };
    
    // Convert amount to string if provided
    if (validatedData.amount !== undefined) {
      updateData.amount = validatedData.amount.toString();
    }
    
    const [updatedExpense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    
    res.json({ 
      message: 'Expense updated successfully',
      expense: updatedExpense 
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(400).json({ error: 'Failed to update expense' });
  }
});

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     description: Delete an expense (only by the payer)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to delete this expense
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Expense not found
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
// Delete expense
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if expense exists and user is the payer
    const [existingExpense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    if (existingExpense.payerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this expense' });
    }
    
    await db
      .delete(expenses)
      .where(eq(expenses.id, id));
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

/**
 * @swagger
 * /api/expenses/{id}/settle:
 *   patch:
 *     summary: Update settlement status of an expense
 *     description: Mark a shared expense as settled or unsettled (only by the payer)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isSettled:
 *                 type: boolean
 *                 description: Whether the expense has been settled
 *             required:
 *               - isSettled
 *     responses:
 *       200:
 *         description: Settlement status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         description: Invalid request data
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
 *       403:
 *         description: Not authorized to update this expense or expense is not shared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Update settlement status of expense
router.patch('/:id/settle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isSettled } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (typeof isSettled !== 'boolean') {
      return res.status(400).json({ error: 'isSettled must be a boolean value' });
    }
    
    // Check if expense exists and user is the payer
    const [existingExpense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    if (existingExpense.payerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update settlement status of this expense' });
    }

    if (!existingExpense.isShared) {
      return res.status(403).json({ error: 'Cannot update settlement status of non-shared expense' });
    }
    
    const [updatedExpense] = await db
      .update(expenses)
      .set({ 
        isSettled,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, id))
      .returning();
    
    res.json({ 
      message: 'Settlement status updated successfully',
      expense: updatedExpense 
    });
  } catch (error) {
    console.error('Update settlement status error:', error);
    res.status(500).json({ error: 'Failed to update settlement status' });
  }
});

export default router;
