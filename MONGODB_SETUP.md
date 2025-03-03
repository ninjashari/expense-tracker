# MongoDB Setup Guide

This guide will help you set up MongoDB for the Finance Tracker application.

## Option 1: MongoDB Atlas (Recommended for Production)

MongoDB Atlas is a fully-managed cloud database service that makes it easy to set up, operate, and scale MongoDB deployments.

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. After signing up, you'll be prompted to create a new organization and project.

### Step 2: Create a Cluster

1. Click on "Build a Database" to create a new cluster.
2. Choose the "FREE" tier option.
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region (choose one closest to your location).
4. Click "Create Cluster" (this may take a few minutes to provision).

### Step 3: Set Up Database Access

1. In the left sidebar, click on "Database Access" under the Security section.
2. Click "Add New Database User".
3. Choose "Password" for the Authentication Method.
4. Enter a username and password (make sure to remember these).
5. Set "Database User Privileges" to "Read and write to any database".
6. Click "Add User".

### Step 4: Configure Network Access

1. In the left sidebar, click on "Network Access" under the Security section.
2. Click "Add IP Address".
3. For development, you can click "Allow Access from Anywhere" (not recommended for production).
4. For production, add specific IP addresses that should have access.
5. Click "Confirm".

### Step 5: Get Your Connection String

1. Go back to the "Database" section and click "Connect" on your cluster.
2. Select "Connect your application".
3. Choose "Node.js" as your driver and the appropriate version.
4. Copy the connection string.
5. Replace `<password>` with your database user's password and `<dbname>` with `finance-tracker`.

### Step 6: Add to Environment Variables

Add the connection string to your `.env.local` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker?retryWrites=true&w=majority
```

## Option 2: Local MongoDB (Development)

### Step 1: Install MongoDB Community Edition

#### Windows:
1. Download the MongoDB Community Server from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and follow the installation wizard.
3. Choose "Complete" installation.
4. You can optionally install MongoDB Compass, a GUI for MongoDB.

#### macOS:
Using Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Step 2: Start MongoDB Service

#### Windows:
MongoDB should be running as a service by default. If not, you can start it from Services.

#### macOS:
```bash
brew services start mongodb-community
```

#### Linux:
```bash
sudo systemctl start mongod
```

### Step 3: Add to Environment Variables

Add the local connection string to your `.env.local` file:

```
MONGODB_URI=mongodb://localhost:27017/finance-tracker
```

## Testing Your Connection

After setting up MongoDB and adding the connection string to your `.env.local` file, you can test the connection by running:

```bash
npm run test-db
```

This will attempt to connect to your MongoDB instance and display information about the connection if successful.

## Troubleshooting

### Connection Refused
- Make sure MongoDB is running
- Check if the connection string is correct
- Verify network access settings (IP whitelist)

### Authentication Failed
- Check if username and password are correct
- Ensure the user has appropriate permissions

### Database Not Found
- The database will be created automatically when you first connect to it
- Make sure the connection string includes the correct database name 