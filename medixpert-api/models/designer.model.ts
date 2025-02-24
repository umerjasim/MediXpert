import { ObjectId } from "mongodb";
import { dbHandler } from "../config/dbConfig";
import { collectionNames } from "../helpers/constants";
import logger from "../helpers/logger";

export async function getPageSizes(): Promise<any> {
    try {
        const pageSizes = await dbHandler(
            collectionNames.pageSizes,
            'find',
            { active: true }
        );
        
        return pageSizes;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getReplacingHashtags(): Promise<any> {
    try {
        const hashtags = await dbHandler(
            collectionNames.replacingHashtags,
            'find',
            { active: true }
        );
        
        return hashtags;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};