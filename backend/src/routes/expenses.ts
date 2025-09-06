import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db.js';
import { expenses, insertExpenseSchema } from '../schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All expense routes require authentication
router.use(authenticateToken);

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
        imageUrl: expenses.imageUrl,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
      })
      .from(expenses)
      .orderBy(desc(expenses.createdAt));
    
    res.json({ expenses: allExpenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

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

// Update expense
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const validatedData = insertExpenseSchema.parse(req.body);
    
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
    
    const [updatedExpense] = await db
      .update(expenses)
      .set({
        ...validatedData,
        amount: validatedData.amount.toString(),
        updatedAt: new Date(),
      })
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

export default router;
