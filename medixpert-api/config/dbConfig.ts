import dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import logger from '../helpers/logger';

dotenv.config();

const url = process.env.DB_URL as string;
let db = process.env.DB_NAME as string | undefined;
console.log(url)
if (!url) {
    throw new Error('MongoDB connection URI is missing!');
}

if (!db) {
    throw new Error('MongoDB connection DB Name is missing!');
}

const client = new MongoClient(url);

export async function connectToDatabase(): Promise<Db> {
    try {
        await client.connect();
        // console.log('Connected to MongoDB');
        return client.db(db);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        logger.error(error?.stack);
        process.exit(1);
    }
}

export async function disconnectDB(): Promise<void> {
    const client = new MongoClient(url);
    if (db) {
        await client?.close();
        db = undefined;
        console.log('Disconnected from MongoDB');
    }
}

export const dbHandler = async (
    collectionName: string,
    operation: string,
    query: object = {},
    options: object = {}
  ): Promise<any> => {
    const database = await connectToDatabase();
    const collection = database.collection(collectionName);
  
    try {
      switch (operation) {
        case 'find':
          return await collection.find(query, options).toArray();
        case 'findOne':
          return await collection.findOne(query, options);
        case 'insertOne':
          return await collection.insertOne(query);
        case 'insertMany':
          return await collection.insertMany(query as any[]);
        case 'updateOne':
          return await collection.updateOne(query, options);
        case 'updateMany':
          return await collection.updateMany(query, options);
        case 'createOrUpdate':
          return await collection.updateOne(query, options, { upsert: true });
        case 'deleteOne':
          return await collection.deleteOne(query);
        case 'deleteMany':
          return await collection.deleteMany(query);
        case 'aggregate':
          return await collection.aggregate(query as any[]).toArray();
        case 'checkAndInsert': {
          const existingDocument = await collection.findOne(query);
          if (existingDocument) {
            return { insertedId: existingDocument._id };
          } else {
            const result = await collection.insertOne(options);
            return { insertedId: result.insertedId };
          }
        }
        case 'countDocuments':
          return await collection.countDocuments(query);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (err) {
      logger.error(err?.stack);
      throw err;
    }
};

export { client };