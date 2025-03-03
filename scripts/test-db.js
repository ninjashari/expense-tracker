// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Define the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Test MongoDB connection
 */
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Mask password in connection string for logging
    console.log(`Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const opts = {
      bufferCommands: false,
    };
    
    await mongoose.connect(MONGODB_URI, opts);
    console.log('\n✅ MongoDB connection successful!');
    
    if (mongoose.connection && mongoose.connection.db) {
      console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
      console.log(`Host: ${mongoose.connection.host}`);
      console.log(`Port: ${mongoose.connection.port || 'default'}`);
      
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