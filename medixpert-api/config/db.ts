import { MongoClient, ObjectId } from 'mongodb';
import { collectionNames } from '../helpers/constants';
import { dbHandler } from './dbConfig';
import logger from '../helpers/logger';
import { MainPages, SubModules, SubPages } from './dbTypes';

const insertPage = async (collection: string, value: any) => {
    try {
        if (!value && !value?.route) {
            throw new Error('Cant insert pages: Insertion value error');
        }
        const existingPage = await dbHandler(collection, 'findOne', { route: value.route });
        if (!existingPage) {
            const pageInsert = await dbHandler(collection, 'insertOne', value);
            const pageId = pageInsert?.insertedId;
            await dbHandler(
                collectionNames.usersRole,
                'updateMany',
                { level: 0 },
                {
                    $addToSet: {
                        access: new ObjectId(pageId)
                    }
                }
            );
            return pageId;
        }
        return existingPage?._id;
    } catch (error) {
        console.error('Error initializing pages:', error);
        logger.error(error?.stack);
        return null;
    }
};

async function initializeDB() {
  try {

    let pageData: MainPages | SubPages | SubModules | {} = {};
    pageData = {
        name: 'Dashboard',
        title: 'Dashboard',
        route: '/dashboard',
        icon: 'DashboardFilled',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    };
    await insertPage(collectionNames?.mainPages, pageData);

    pageData = {
        name: 'General',
        title: 'General',
        route: '/general',
        icon: 'AimOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    const generalId = await insertPage(collectionNames?.mainPages, pageData);
    
    pageData = {
        mainPageId: generalId,
        name: 'Items',
        title: 'Items',
        route: '/items',
        icon: 'DropboxOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

    pageData = {
        mainPageId: generalId,
        name: 'Suppliers',
        title: 'Suppliers',
        route: '/suppliers',
        icon: 'ClusterOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

    pageData = {
        name: 'Masters',
        title: 'Masters',
        route: '/masters',
        icon: 'ControlOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    const masterId = await insertPage(collectionNames?.mainPages, pageData);

    pageData = {
        mainPageId: masterId,
        name: 'Taxes',
        title: 'Taxes',
        route: '/taxes',
        icon: 'BookOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);
    
    pageData = {
        name: 'Transactions',
        title: 'Transactions',
        route: '/transactions',
        icon: 'SwapOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    const transactionId = await insertPage(collectionNames?.mainPages, pageData);

    pageData = {
        mainPageId: transactionId,
        name: 'Purchase Entry',
        title: 'Purchase Entry',
        route: '/purchase-entry',
        icon: 'DiffOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

    pageData = {
        mainPageId: transactionId,
        name: 'Approve Purchase Entry',
        title: 'Approve Purchase Entry',
        route: '/approve-purchase-entry',
        icon: 'FileDoneOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

    pageData = {
        mainPageId: transactionId,
        name: 'Sale',
        title: 'Sale',
        route: '/sale',
        icon: 'ShoppingOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

    pageData = {
        name: 'Others',
        title: 'Others',
        route: '/others',
        icon: 'HolderOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    const othersId = await insertPage(collectionNames?.mainPages, pageData);

    pageData = {
        mainPageId: othersId,
        name: 'Designer',
        title: 'Designer',
        route: '/designer',
        icon: 'MacCommandOutlined',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date
        }
    }
    await insertPage(collectionNames?.subPages, pageData);

  } catch (error) {
    console.error('Error initializing pages:', error);
    logger.error(error?.stack);
    process.exit(1);
  }
};

export default initializeDB;
