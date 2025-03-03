# Finance Tracker

A comprehensive personal finance management application built with Next.js, MongoDB, and TypeScript.

## Features

- **User Authentication**: Secure login and registration system
- **Account Management**: Add and manage different types of accounts (savings, demat, credit cards, etc.)
- **Transaction Tracking**: Record and categorize your financial transactions
- **Categories & Payees**: Organize transactions with custom categories and payees
- **Reports**: Generate custom reports based on accounts, categories, and transaction types
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Headless UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/finance-tracker.git
   cd finance-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

   For MongoDB Atlas:
   1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   2. Create a new cluster
   3. Click "Connect" and select "Connect your application"
   4. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>` with your credentials
   5. Your connection string should look like: `mongodb+srv://username:password@cluster.mongodb.net/finance-tracker?retryWrites=true&w=majority`

   For local MongoDB:
   1. Install MongoDB Community Edition on your machine
   2. Start the MongoDB service
   3. Use the connection string: `mongodb://localhost:27017/finance-tracker`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: React components
- `/src/lib`: Utility functions, database connection, and models
- `/src/lib/models`: MongoDB models
- `/src/lib/types.ts`: TypeScript interfaces and types

## License

This project is licensed under the MIT License - see the LICENSE file for details.
