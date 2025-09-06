import { db } from './src/db.ts';
import { users, expenses, settlements } from './src/schema.ts';

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database connection and tables...');
    
    // Test database connection
    const usersCount = await db.select().from(users);
    console.log(`✅ Users table: ${usersCount.length} records`);
    
    const expensesCount = await db.select().from(expenses);
    console.log(`✅ Expenses table: ${expensesCount.length} records`);
    
    const settlementsCount = await db.select().from(settlements);
    console.log(`✅ Settlements table: ${settlementsCount.length} records`);
    
    console.log('🎉 Database verification completed successfully!');
    
    if (usersCount.length > 0) {
      console.log('\n👥 Sample users:');
      usersCount.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();
