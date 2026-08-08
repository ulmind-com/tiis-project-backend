const { MongoClient } = require('mongodb');

const OLD_DB_URI = "mongodb+srv://Sagnik_db_healthy_motive:Healthy%4027@cluster0.fefdewd.mongodb.net/?appName=Cluster0";
const NEW_DB_URI = "mongodb+srv://tiisdigitalmarketingteam_db_user:x7RtAVxixbhvAslL@cluster0.shyu81i.mongodb.net/";

async function verifyData() {
  let oldClient, newClient;
  try {
    oldClient = await MongoClient.connect(OLD_DB_URI);
    const oldDb = oldClient.db('test'); // The default database where data was
    
    newClient = await MongoClient.connect(NEW_DB_URI);
    const newDb = newClient.db();

    const collections = await oldDb.listCollections().toArray();
    console.log(`Checking ${collections.length} collections...`);
    console.log("--------------------------------------------------");
    console.log(String("Collection").padEnd(20) + " | " + String("Old DB Count").padEnd(15) + " | " + "New DB Count");
    console.log("--------------------------------------------------");

    let allMatched = true;

    for (let collection of collections) {
      const colName = collection.name;
      const oldDocCount = await oldDb.collection(colName).countDocuments();
      const newDocCount = await newDb.collection(colName).countDocuments();

      console.log(String(colName).padEnd(20) + " | " + String(oldDocCount).padEnd(15) + " | " + newDocCount);

      if (oldDocCount !== newDocCount) {
        allMatched = false;
      }
    }
    
    console.log("--------------------------------------------------");
    if (allMatched) {
      console.log("✅ SUCCESS: All data from the old database is present in the new database.");
    } else {
      console.log("❌ WARNING: Some collections have a mismatched document count.");
    }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
    process.exit(0);
  }
}

verifyData();
