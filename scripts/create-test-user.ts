import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  console.log('Creating a test user with ID 1...');
  
  try {
    // Check if user with ID 1 already exists
    const existingUser = await db.select().from(users).where(eq(users.id, 1));
    
    if (existingUser.length > 0) {
      console.log('User with ID 1 already exists, skipping creation');
      return;
    }
    
    // Insert the test user
    await db.insert(users).values({
      id: 1,
      username: 'testuser',
      password: 'password123', // In a real app, this would be hashed
      pawPoints: 0
    });
    
    console.log('Successfully created test user with ID 1');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the function
createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create test user:', error);
    process.exit(1);
  });