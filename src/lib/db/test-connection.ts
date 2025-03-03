import mongoose from 'mongoose';

// Define the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Test MongoDB connection
 * Run this script with: npx ts-node -r dotenv/config src/lib/db/test-connection.ts
 */
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const opts = {
      bufferCommands: false,
    };
    
    const connection = await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ MongoDB connection successful!');
    
    if (connection.connection && connection.connection.db) {
      console.log(`Connected to database: ${connection.connection.db.databaseName}`);
      console.log(`Host: ${connection.connection.host}`);
      console.log(`Port: ${connection.connection.port}`);
      
      // List all collections
      const collections = await connection.connection.db.listCollections().toArray();
      console.log('\nAvailable collections:');
      if (collections.length === 0) {
        console.log('No collections found. Your database is empty.');
      } else {
        collections.forEach((collection: { name: string }) => {
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