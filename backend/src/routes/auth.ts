import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { users, loginSchema, registerSchema } from '../schema.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(validatedData.password);
    
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      })
      .returning();
    
    const token = generateToken(newUser);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profileImageUrl: newUser.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Invalid registration data' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid login data' });
  }
});

// Login page (for demo purposes)
router.get('/login', (req: Request, res: Response) => {
  // In a real app, this would redirect to OAuth provider or show login form
  // For now, return instructions for demo
  res.json({ 
    message: 'Authentication required',
    instructions: 'Use POST /api/auth/login with email and password',
    demo: {
      register_url: '/api/auth/register',
      login_url: '/api/auth/login (POST)',
      example: {
        email: 'user@example.com',
        password: 'your-password',
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  });
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  // For JWT-based auth, logout is handled on client side
  // Just return success response
  res.json({ message: 'Logout successful' });
});

export default router;
