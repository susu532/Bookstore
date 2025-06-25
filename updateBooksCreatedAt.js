// updateBooksCreatedAt.js
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

async function updateBooks() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/books');
  const result = await Book.updateMany(
    { createdAt: { $exists: false } },
    { $set: { createdAt: new Date() } }
  );
  console.log(`Books updated: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

updateBooks().catch(err => { console.error(err); process.exit(1); });
