import { db } from '../server/db';
import { users } from '../shared/schema';

async function createTestUser() {
  console.log('Creating a test user with ID 1...');
  
  try {
    // Insert the test user directly with ID 1
    const result = await db.insert(users).values({
      id: 1,
      username: 'testuser',
      password: 'password123', // In a real app, this would be hashed
      pawPoints: 0
    }).returning();
    
    console.log('Successfully created test user:', result);
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