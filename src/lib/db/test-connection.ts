import dbConnect from './connection';

/**
 * Test MongoDB connection
 * Run this script with: npx ts-node -r dotenv/config src/lib/db/test-connection.ts
 */
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoose = await dbConnect();
    console.log('✅ MongoDB connection successful!');
    
    if (mongoose.connection && mongoose.connection.db) {
      console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
      console.log(`Host: ${mongoose.connection.host}`);
      console.log(`Port: ${mongoose.connection.port}`);
      
      // List all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nAvailable collections:');
      if (collections.length === 0) {
        console.log('No collections found. Your database is empty.');
      } else {
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      }
    } else {
      console.log('Connection established but database information is not available.');
    }
    
    // Close the connection
    await mongoose.disconnect();
    console.log('\nConnection closed successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testConnection(); 