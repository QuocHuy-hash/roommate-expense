import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db.js';
import { settlements, insertSettlementSchema } from '../schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All settlement routes require authentication
router.use(authenticateToken);

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

// Create new settlement
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const validatedData = insertSettlementSchema.parse(req.body);
    
    const [newSettlement] = await db
      .insert(settlements)
      .values({
        ...validatedData,
        amount: validatedData.amount.toString(),
        payerId: userId,
      })
      .returning();
    
    res.status(201).json({ 
      message: 'Settlement created successfully',
      settlement: newSettlement 
    });
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(400).json({ error: 'Invalid settlement data' });
  }
});

export default router;
