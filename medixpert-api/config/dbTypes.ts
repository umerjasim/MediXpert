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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
        mail: string | null,
        mobile: number | null,
    };
    address: {
        line1: string | null;
        line2: string | null;
        place: string | null; 
        pin: number | null,
    };
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    branchId: ObjectId | null,
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    },
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
    branches: ObjectId[] | null,
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    },
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
    branches: ObjectId[] | null,
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    },
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
    },
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
    roundOff: number;
    netInvoiceAmount: number;
    taxSplit: any[] | null;
    active: boolean;
    created: {
        by: ObjectId | 'system';
        on: string;
        date: Date;
    },
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
    },
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
    itemId: ObjectId;
    branchId: ObjectId;
    outletId: ObjectId;
    stock: number;
    transferId: ObjectId | null;
    isFree: boolean;
    price: {
        itemCost: number,
        itemPrice: number,
        itemMRP: number
    },
    tax: {
        taxId: ObjectId,
        taxType: string,
        taxValue: number,
        inclusive: boolean,
        subTaxes: [] | null,
    },
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