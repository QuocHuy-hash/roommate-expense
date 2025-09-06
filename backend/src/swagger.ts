import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'RoomMate Expense Management API',
      version: '1.0.0',
      description: 'API cho ứng dụng quản lý chi tiêu chung giữa các roommate',
      contact: {
        name: 'Development Team',
        email: 'dev@roommate-expense.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com'
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server'
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            profileImageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            title: {
              type: 'string',
              example: 'Grocery Shopping',
            },
            amount: {
              type: 'string',
              example: '150.75',
              description: 'Amount as decimal string',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Weekly grocery shopping at supermarket',
            },
            payerId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            isShared: {
              type: 'boolean',
              default: true,
              example: true,
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/receipt.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Settlement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            payerId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
              description: 'User who made the payment',
            },
            payeeId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
              description: 'User who received the payment',
            },
            amount: {
              type: 'string',
              example: '75.50',
              description: 'Amount as decimal string',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Settlement for grocery expenses',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/transfer-receipt.jpg',
              description: 'Bank transfer receipt image',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
          },
        },
        CreateExpenseRequest: {
          type: 'object',
          required: ['title', 'amount'],
          properties: {
            title: {
              type: 'string',
              example: 'Grocery Shopping',
            },
            amount: {
              type: 'string',
              example: '150.75',
              description: 'Amount as decimal string',
            },
            description: {
              type: 'string',
              example: 'Weekly grocery shopping',
            },
            isShared: {
              type: 'boolean',
              default: true,
              example: true,
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/receipt.jpg',
            },
          },
        },
        CreateSettlementRequest: {
          type: 'object',
          required: ['payeeId', 'amount'],
          properties: {
            payeeId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
              description: 'ID of user receiving the payment',
            },
            amount: {
              type: 'string',
              example: '75.50',
              description: 'Amount as decimal string',
            },
            description: {
              type: 'string',
              example: 'Settlement for shared expenses',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/transfer-receipt.jpg',
              description: 'Bank transfer receipt image',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT token for authentication',
            },
          },
        },
        ExpenseResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Expense created successfully',
            },
            expense: {
              $ref: '#/components/schemas/Expense',
            },
          },
        },
        ExpensesListResponse: {
          type: 'object',
          properties: {
            expenses: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Expense',
              },
            },
          },
        },
        SettlementResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Settlement created successfully',
            },
            settlement: {
              $ref: '#/components/schemas/Settlement',
            },
          },
        },
        SettlementsListResponse: {
          type: 'object',
          properties: {
            settlements: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Settlement',
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Invalid input data',
            },
            message: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Expenses',
        description: 'Expense management',
      },
      {
        name: 'Settlements',
        description: 'Settlement management',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export default specs;
