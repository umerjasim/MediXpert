import { ObjectId } from "mongodb";
import { dbHandler } from "../config/dbConfig";
import { collectionNames } from "../helpers/constants";
import logger from "../helpers/logger";
import { DocumentMaster } from "../config/dbTypes";

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

export async function getDocumentTypes(): Promise<any> {
    try {
        const docTypes = await dbHandler(
            collectionNames.documentTypes,
            'find',
            { active: true }
        );
        
        return docTypes;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getDocumentMasterWithName(name: string | null): Promise<any> {
    try {
        const docMaster: DocumentMaster = await dbHandler(
            collectionNames.documentMaster,
            'findOne',
            { active: true, name }
        );
        
        return docMaster;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function upsertDocumentMaster(
    data: DocumentMaster,
    contentId: ObjectId | null
): Promise<boolean | null> {
    try {
        const filter = contentId ? { _id: contentId } : {};
        const update = { $set: data };

        await dbHandler(
            collectionNames.documentMaster,
            'createOrUpdate',
            filter,
            update
        );

        return true;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
}

export async function getDocumentMaster(): Promise<any> {
    try {
        const docMaster: DocumentMaster = await dbHandler(
            collectionNames.documentMaster,
            'aggregate',
            [
                {
                    $match: {
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.documentTypes,
                        localField: "docType",
                        foreignField: "_id",
                        as: "documentTypes"
                    }
                },
                {
                    $unwind: { path: "$documentTypes" }
                },
                {
                    $lookup: {
                        from: collectionNames.pageSizes,
                        localField: "pageType",
                        foreignField: "_id",
                        as: "pageType"
                    }
                },
                {
                    $unwind: { path: "$pageType" }
                },
                {
                    $project: {
                        contentHtml: 1,
                        name: 1,
                        orientation: 1,
                        'documentTypes._id': 1,
                        'documentTypes.value': 1,
                        'documentTypes.name': 1,
                        'pageType._id': 1,
                        'pageType.name': 1,
                        'pageType.height': 1,
                        'pageType.width': 1,
                    }
                }
            ]
        );
        
        return docMaster;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};