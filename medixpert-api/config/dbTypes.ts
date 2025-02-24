import { ObjectId } from 'mongodb';

//genders
export type Gender = {
    _id: ObjectId;
    name: string;
    code: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//titles
export type Title = {
    _id: ObjectId;
    name: string;
    genderId: ObjectId | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//usersLogin
export type UsersLogin = {
    _id: ObjectId;
    username: string;
    password: string;
    roleId: ObjectId | null;
    loginAttempts: {
        count: number | null;
        lastDate: Date | null;
    };
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//users
export type Users = {
    _id: ObjectId;
    userId: ObjectId | null;
    titleId: ObjectId | null;
    name: {
        first: string;
        last: string | null;
    };
    dob: Date | null;
    age: {
        number: string | null;
        on: Date | null;
    };
    picture: {
        fileName: string | null;
        filePath: string | null;
        fileSize: number | null;
        fileType: string | null;
    };
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//usersRole
export type UsersRole = {
    _id: ObjectId;
    name: string;
    access: Array<ObjectId>;
    level: number;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//usersAccess
export type UsersAccess = {
    _id: ObjectId;
    userId: ObjectId;
    mainPages: Array<ObjectId> | null;
    subPages: Array<ObjectId> | null;
    subModules: Array<ObjectId> | null;
    branches: Array<ObjectId> | null;
    outlets: Array<ObjectId> | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//mainPages
export type MainPages = {
    _id: ObjectId;
    name: string;
    title: string;
    route: string;
    icon: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//subPages
export type SubPages = {
    _id: ObjectId;
    mainPageId: ObjectId | null;
    name: string;
    title: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//subModules
export type SubModules = {
    _id: ObjectId;
    subPageId: ObjectId | null;
    name: string;
    title: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//jwtToken
export type JWTToken = {
    _id: ObjectId;
    userId: ObjectId;
    token: string;
    refreshToken: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    }
}

//usersOTP
export type UsersOTP = {
    _id: ObjectId;
    userId: ObjectId;
    otp: number;
    sendMail: string;
    active: true;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    verified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//usersAddress
export type UsersAddress = {
    _id: ObjectId;
    userId: ObjectId;
    contact: {
        mail: string | null;
        mobile: number | null;
    };
    address: {
        line1: string | null;
        line2: string | null;
        place: string | null; 
        pin: number | null;
    };
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//attachments
export type Attachements = {
    _id: ObjectId;
    title: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | 'system' | null;
        on: string | null;
        date: Date | null;
    }
}

//usersQualification
export type UsersQualification = {
    _id: ObjectId;
    userId: ObjectId;
    title: string;
    startDate: Date;
    endDate: Date | 'present';
    comments: string;
    attachementIds: Array<ObjectId>;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//sendMailAuth
export type SendMailAuth = {
    _id: ObjectId;
    mail: string;
    passKey: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//lastLoginLogout
export type LastLoginLogout = {
    _id: ObjectId;
    userId: ObjectId;
    loginOn: string;
    loginDate: Date;
    logoutOn: string;
    logoutDate: Date;
}

//itemMaster
export type ItemMaster = {
    _id: ObjectId;
    name: string;
    isDrug: boolean;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemType
export type ItemType = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemCategory
export type ItemCategory = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemQtyUnit
export type ItemQtyUnit = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemCode
export type ItemCode = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemRisk
export type ItemRisk = {
    _id: ObjectId;
    name: string;
    color: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemSuppliers
export type ItemSuppliers = {
    _id: ObjectId;
    name: string;
    contact: {
        mail: string | null;
        mobile: number | null;
    };
    address: {
        line1: string | null;
        line2: string | null;
        place: string | null;
        pin: number | null;
    };
    gst: string | number;
    licence: string | null;
    branches: ObjectId[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemRemarks
type ItemRemarks = {
    title: string;
    description: string;
}

//items
export type Items = {
    _id: ObjectId;
    name: string;
    genericId: ObjectId;
    masterId: ObjectId;
    typeId: ObjectId;
    categoryId: ObjectId | null;
    qtyUnitId: ObjectId;
    reorderQty: number;
    riskId: ObjectId;
    remarks: ItemRemarks[] | null; 
    branches: ObjectId[];
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//genericNames
export type GenericNames = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//branches
export type Branches = {
    _id: ObjectId;
    name: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//outlets
export type Outlets = {
    _id: ObjectId;
    name: string;
    branchId: ObjectId | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//purchaseFormTypes
export type PurchaseFormTypes = {
    _id: ObjectId;
    name: string;
    branches: ObjectId[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//purchaseTypes
export type PurchaseTypes = {
    _id: ObjectId;
    name: string;
    branches: ObjectId[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//purchaseEntries
export type PurchaseEntries = {
    _id: ObjectId;
    grnNo: string;
    branchId: ObjectId;
    outletId: ObjectId;
    supplierId: ObjectId;
    formTypeId: ObjectId;
    purchaseTypeId: ObjectId;
    purachseOrderNo: string;
    invoiceNo: string;
    invoiceDate: Date;
    entryDate: Date;
    remarks: string;
    attachementId: ObjectId | null;
    active: boolean;
    approved: {
        status: boolean;
        by: ObjectId | null;
        on: string;
        date: Date;
    };
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//purchaseEntryAmounts
export type PurchaseEntryAmounts = {
    _id: ObjectId;
    purchaseEntryId: ObjectId;
    taxableAmount: number;
    nonTaxableAmount: number;
    itemsDiscount: number;
    extraDiscount: number;
    totalTaxAmount: number;
    totalAmount: number;
    totalMrp: number;
    roundOff: number;
    netInvoiceAmount: number;
    taxSplit: any[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//purchaseEntryItems
export type PurchaseEntryItems = {
    _id: ObjectId;
    purchaseEntryId: ObjectId;
    itemId: ObjectId;
    manufacturerId: ObjectId;
    hsnNo: string;
    batchNo: string;
    rackNo: string;
    expiry: Date;
    pack: number;
    packUnitId: ObjectId;
    qty: number;
    freeQty: number;
    totalFreeQty: number;
    rate: number;
    totalCost: number;
    costPerQty: number;
    totalQty: number;
    mrp: number;
    mrpPerQty: number;
    discount: string;
    discountAmount: number;
    totalAmount: number;
    taxId: ObjectId;
    taxInclusive: boolean;
    taxIdForFree: ObjectId | null;
    margin: number;
    ptr: number;
    outletId: ObjectId;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//manufacturers
export type Manufacturers = {
    _id: ObjectId;
    name: string;
    contact: {
        mail: string | null;
        mobile: number | null;
    };
    address: {
        line1: string | null;
        line2: string | null;
        place: string | null;
        pin: number | null;
    };
    gst: string | number;
    licence: string | null;
    branches: ObjectId[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//itemsStock
export type ItemsStock = {
    _id: ObjectId;
    purchaseId: ObjectId;
    transferId: ObjectId | null;
    itemId: ObjectId;
    branchId: ObjectId;
    outletId: ObjectId;
    hsnNo: string;
    batchNo: string;
    rackNo: string;
    expiry: Date | null;
    pack: number;
    packUnitId: ObjectId;
    qty: number;
    freeQty: number;
    totalFreeQty: number;
    rate: number;
    totalCost: number;
    costPerQty: number;
    totalQty: number;
    mrp: number;
    mrpPerQty: number;
    discount: string;
    discountAmount: number;
    totalAmount: number;
    margin: number;
    ptr: number;
    tax: {
        taxId: ObjectId;
        taxType: string;
        taxValue: number;
        inclusive: boolean;
        subTaxes: [] | null;
    };
    taxForFree: {
        taxId: ObjectId;
        taxType: string;
        taxValue: number;
        inclusive: boolean;
        subTaxes: [] | null;
    } | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//paymentTypes
export type PaymentTypes = {
    _id: ObjectId;
    type: string;
    name: string;
    branches: ObjectId[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//saleMaster
export type SaleMaster = {
    _id: ObjectId;
    patientVisitId: ObjectId;
    invoiceNo: string;
    totalAmount: number;
    discountAmount: number;
    grandTotal: number;
    roundedGrandTotal: number;
    roundoffGrandTotal: number;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//saleItems
export type SaleItems = {
    _id: ObjectId;
    saleMasterId: ObjectId;
    itemId: ObjectId;
    batchNo: string;
    qty: number;
    amount: number;
    expiry: string;
    hsnNo: string;
    rackNo: string;
    unit: string;
    rate: number;
    balanceStock: number;
    tax: {
        taxId: ObjectId;
        taxType: string;
        taxValue: number;
        inclusive: boolean;
        subTaxes: {
            id: ObjectId;
            name: string;
            value: number;
            type: string
        }[]
    };
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//salePatientMaster
export type SalePatientMaster = {
    _id: ObjectId;
    patientId: number;
    mobileCode: string;
    mobileNo: number;
    title: ObjectId;
    fullName: string;
    place: ObjectId;
    gender: ObjectId;
    doctor: ObjectId;
    age: { years: number; months: number; days: number }
    dob: Date;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//salePatientVisit
export type SalePatientVisit = {
    _id: ObjectId;
    patientMasterId: ObjectId;
    patientVisitId: number;
    saleMasterId: ObjectId;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//saleInvoice
export type SaleInvoice = {
    _id: ObjectId;
    saleMasterId: ObjectId;
    html: string;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//doctors
export type Doctors = {
    _id: ObjectId;
    title: ObjectId;
    fullName: string;
    qualification: string;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//places
export type Places = {
    _id: ObjectId;
    name: string;
    pin: number;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//billMaster
export type BillMaster = {
    _id: ObjectId;
    saleMasterId: ObjectId;
    billNo: string;
    totalPaidAmount: number;
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//billDetails
export type BillPaymentMode ={
    mode: string;
    amount: number;
    transactionNo: string;
    remarks: string;
    isMain: boolean;
}
export type BillDetails = {
    _id: ObjectId;
    billMasterId: ObjectId;
    paidAmount: number;
    paymentModes: BillPaymentMode[];
    branch: ObjectId;
    outlet: ObjectId;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//saleBill
export type SaleBill = {
    _id: ObjectId;
    billMasterId: ObjectId;
    html: string;
    active: boolean;
    created: {
        by: ObjectId;
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//pageSizes
export type PageSizes = {
    _id: ObjectId;
    name: string;
    height: {
        value: number;
        unit: string;
    };
    width: {
        value: number;
        unit: string;
    };
    default: 'p' | 'l';
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}

//replacingHashtags
export type ReplacingHashtags = {
    _id: ObjectId;
    key: string;
    value: string;
    description: string;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    };
    modified: {
        by: ObjectId | null;
        on: string | null;
        date: Date | null;
    }
}
