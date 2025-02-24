import { MongoClient, ObjectId, Db, Collection } from "mongodb";
import { collectionNames } from "../helpers/constants";
import dotenv from 'dotenv';
import logger from "../helpers/logger";

dotenv.config();

const url = process.env.DB_URL as string;
let db = process.env.DB_NAME as string | undefined;

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
        return client.db(db);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        logger.error(error?.stack);
        process.exit(1);
    }
}

async function updateIndexes() {
  const db = await connectToDatabase();

  for (const collectionKey of Object.keys(collectionNames) as (keyof typeof collectionNames)[]) {
    const collectionName = collectionNames[collectionKey];

    console.log(`Updating indexes for collection: ${collectionName}`);

    const collection = db.collection(collectionName);

    const objectIdFields: string[] = getObjectIdFieldsForCollection(collectionKey);

    for (const field of objectIdFields) {
      const indexSpec = { [field]: 1 };
      try {
        const result = await collection.createIndex(indexSpec);
        console.log(`Index created for field "${field}" in collection "${collectionName}": ${result}`);
      } catch (error) {
        console.error(`Failed to create index for field "${field}" in collection "${collectionName}": ${error}`);
      }
    }
  }

  console.log("Indexes updated successfully.");
}

function getObjectIdFieldsForCollection(collectionKey: keyof typeof collectionNames): string[] {
  const objectIdFieldsMap: Record<string, string[]> = {
    genders: ["created.by", "modified.by"],
    titles: ["genderId", "created.by", "modified.by"],
    usersLogin: ["roleId", "created.by", "modified.by"],
    users: ["userId", "titleId", "created.by", "modified.by"],
    usersRole: ["created.by", "modified.by"],
    usersAccess: ["userId", "mainPages", "subPages", "subModules", "branches", "outlets", "created.by", "modified.by"],
    mainPages: ["created.by", "modified.by"],
    subPages: ["mainPageId", "created.by", "modified.by"],
    SubModules: ["subPageId", "created.by", "modified.by"],
    jwtToken: ["userId", "created.by"],
    usersOTP: ["userId", "created.by", "verified.by"],
    usersAddress: ["userId", "created.by", "modified.by"],
    attachments: ["created.by", "modified.by"],
    usersQualification: ["userId", "created.by", "modified.by"],
    sendMailAuth: ["created.by", "modified.by"],
    lastLoginLogout: ["userId"],
    itemMaster: ["genericId", "supplierId", "created.by", "modified.by"],
    itemType: ["created.by", "modified.by"],
    itemCategory: ["created.by", "modified.by"],
    itemQtyUnit: ["created.by", "modified.by"],
    itemCode: ["created.by", "modified.by"],
    itemRisk: ["created.by", "modified.by"],
    itemSuppliers: ["created.by", "modified.by"],
    items: ["genericId", "masterId", "typeId", "categoryId", "qtyUnitId", "riskId", "branches", "created.by", "modified.by"],
    genericNames: ["created.by", "modified.by"],
    branches: ["created.by", "modified.by"],
    outlets: ["branchId", "created.by", "modified.by"],
    purchaseFormTypes: ["branches", "created.by", "modified.by"],
    purchaseTypes: ["branches", "created.by", "modified.by"],
    purchaseEntries: ["branchId", "outletId", "supplierId", "formTypeId", "purchaseTypeId", "attachementId", "approved.by", "created.by", "modified.by"],
    purchaseEntryAmounts: ["purchaseEntryId", "created.by", "modified.by"],
    purchaseEntryItems: ["purchaseEntryId", "itemId", "manufacturerId", "packUnitId", "taxId", "taxIdForFree", "outletId", "created.by", "modified.by"],
    manufacturers: ["created.by", "modified.by"],
    itemsStock: ["purchaseId", "transferId", "itemId", "branchId", "outletId", "packUnitId", "tax.taxId", "taxForFree.taxId", "created.by", "modified.by"],

    // Add more collections and their ObjectId fields as needed
  };

  return objectIdFieldsMap[collectionKey] || [];
}

export default updateIndexes;