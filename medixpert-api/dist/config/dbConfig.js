"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.dbHandler = void 0;
exports.connectToDatabase = connectToDatabase;
exports.disconnectDB = disconnectDB;
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const logger_1 = __importDefault(require("../helpers/logger"));
dotenv_1.default.config();
const url = process.env.DB_URL;
let db = process.env.DB_NAME;
console.log(url);
console.log(db);
if (!url) {
    throw new Error('MongoDB connection URI is missing!');
}
if (!db) {
    throw new Error('MongoDB connection DB Name is missing!');
}
const client = new mongodb_1.MongoClient(url);
exports.client = client;
async function connectToDatabase() {
    try {
        await client.connect();
        // console.log('Connected to MongoDB');
        return client.db(db);
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        logger_1.default.error(error === null || error === void 0 ? void 0 : error.stack);
        process.exit(1);
    }
}
async function disconnectDB() {
    const client = new mongodb_1.MongoClient(url);
    if (db) {
        await (client === null || client === void 0 ? void 0 : client.close());
        db = undefined;
        console.log('Disconnected from MongoDB');
    }
}
const dbHandler = async (collectionName, operation, query = {}, options = {}) => {
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
                return await collection.insertMany(query);
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
                return await collection.aggregate(query).toArray();
            case 'checkAndInsert': {
                const existingDocument = await collection.findOne(query);
                if (existingDocument) {
                    return { insertedId: existingDocument._id };
                }
                else {
                    const result = await collection.insertOne(options);
                    return { insertedId: result.insertedId };
                }
            }
            case 'countDocuments':
                return await collection.countDocuments(query);
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }
    catch (err) {
        logger_1.default.error(err === null || err === void 0 ? void 0 : err.stack);
        throw err;
    }
};
exports.dbHandler = dbHandler;
