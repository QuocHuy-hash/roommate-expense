import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db.js';
import { settlements, insertSettlementSchema } from '../schema.js';
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
