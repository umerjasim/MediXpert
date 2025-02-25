import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { getDocumentMaster, getDocumentMasterWithName, getDocumentTypes, getPageSizes, getReplacingHashtags, upsertDocumentMaster } from "../models/designer.model";
import { DocumentMaster } from "../config/dbTypes";
import { ObjectId } from "mongodb";

export async function getData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet } = req.user;

        const pageSizes = await getPageSizes();

        const hashtags = await getReplacingHashtags();

        const documentTypes = await getDocumentTypes();

        const documentMaster = await getDocumentMaster();

        return res.status(requestCode.SUCCESS)
            .send({ pageSizes, hashtags, documentTypes, documentMaster });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}

export async function saveContent(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet, userId } = req.user;
        const { contentId, content, type, name, pageType, orientation } = req.body;

        const docMaster = await getDocumentMasterWithName(name);
        if (docMaster) {
            return res.status(requestCode.BAD_REQUEST)
                .send({ error: geti18nResponse(req, 'docNameAlreadyExist', msg.docNameAlreadyExist) });
        }

        const documentMasterData: DocumentMaster = {
            _id: new ObjectId(),
            docType: new ObjectId(type),
            name,
            contentHtml: content,
            pageType: new ObjectId(pageType),
            orientation,
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };
        await upsertDocumentMaster(documentMasterData, contentId);

        return res.status(requestCode.SUCCESS)
            .send({ message: geti18nResponse(req, 'success', msg.success) });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}