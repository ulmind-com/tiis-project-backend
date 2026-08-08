const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// REPLACE THIS WITH YOUR OLD DATABASE URI
const OLD_DB_URI = "mongodb+srv://Sagnik_db_healthy_motive:Healthy%4027@cluster0.fefdewd.mongodb.net/?appName=Cluster0";

// THE NEW DATABASE URI YOU PROVIDED
const NEW_DB_URI = "mongodb+srv://tiisdigitalmarketingteam_db_user:x7RtAVxixbhvAslL@cluster0.shyu81i.mongodb.net/";

async function migrateData() {
  let oldClient, newClient;
  try {
    console.log('Connecting to old database...');
    oldClient = await MongoClient.connect(OLD_DB_URI);
    const oldDb = oldClient.db();
    
    console.log('Connecting to new database...');
    newClient = await MongoClient.connect(NEW_DB_URI);
    const newDb = newClient.db();

    const collections = await oldDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate.`);

    for (let collection of collections) {
      const colName = collection.name;
      console.log(`\nMigrating collection: ${colName}`);
      
      const documents = await oldDb.collection(colName).find({}).toArray();
      console.log(`Read ${documents.length} documents from old DB.`);
      
      if (documents.length > 0) {
        // Clear existing data in the new collection (optional, depends on needs)
        // await newDb.collection(colName).deleteMany({}); 
        
        // Insert documents into new DB
        await newDb.collection(colName).insertMany(documents);
        console.log(`Inserted ${documents.length} documents into new DB.`);
      } else {
        console.log(`Skipping empty collection: ${colName}`);
      }
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
    process.exit(0);
  }
}

migrateData();
