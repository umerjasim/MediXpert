import { InputNumber, TimeRangePickerProps } from 'antd';
import { GB, IN } from 'country-flag-icons/react/3x2';
import dayjs from 'dayjs';

const Constant = {
    appName: 'MediXpert',

    token: 'token',
    refreshToken: 'refreshToken',

    notificationDuration: 3,

    dateFormatToDB: 'YYYY-MM-DD',
    dateFormat: 'DD-MM-YYYY',
    dateTimeFormat: 'DD-MM-YYYY hh:mm a',

    paginationSize: 100,

    roundOffs: {
        normal: 2,
        taxSplit: 2,
        purchaseEntry: {
            rate: 2,
            totalCost: 2,
            costPerQty: 2,
            mrp: 2,
            mrpPerQty: 2,
            totalAmount: 2,
            margin: 2,
            ptr: 2,
            discount: 2,
            tax: 2,
            netInvoice: 0
        },
        sale: {
            amount: 2,
            tax: 2,
            discount: 2
        }
    },

    currency: 'Indian Rupee',
    currencyISO: 'INR',
    currencySymbol: '₹',
    currencyShort: 'Rs',
    currencyForBill: {
        name: 'Rupee',
        plural: 'Rupees',
        fractionalUnit: {
            name: 'Paisa',
            plural: 'Paise'
        },
    },

    country: 'India',
    countryCode: 'IN',
    countryDialCode: '+91',

    userAccess: {
        user: 1,
        role: 2,
        general: 3,
        client: 4,
        plant: 5,
        equipment: 6,
        checklist: 7,
        task: 8,
        report: 9,
        configuration: 10,
        dashboard: 20,
        thicknessSummary: 26
    },

    languageList: [
        { 
            key: 'lang-en', 
            value: 'en', 
            label: <><span style={{ marginRight: '8px' }}><GB width="15" /></span>English</>, 
            flag: <GB width="15" /> 
        },
        { 
            key: 'lang-ml', 
            value: 'ml', 
            label: <><span style={{ marginRight: '8px' }}><IN width="15" /></span>മലയാളം</>, 
            flag: <IN width="15" /> 
        },
    ],
};

export default Constant;