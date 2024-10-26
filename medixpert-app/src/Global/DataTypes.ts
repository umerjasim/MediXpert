
type Added = {
    on: string;
    by: string;
    date: Date;
};

type Modified = {
    on: string | null;
    by: string | null;
    date: Date | null;
};

export type AccessPagesType = {
    _id: string;
    name: string;
    title: string;
    route: string;
    icon: string;
    subPages: AccessPagesType[] | null;
};

export type ItemMaster = {
    _id: string;
    name: string;
    isDrug: boolean;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemType = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemCategory = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemCode = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemQtyUnit = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemRisk = {
    _id: string;
    name: string;
    color: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type ItemGeneric = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type Branches = {
    _id: string;
    name: string;
    active: boolean;
    added: Added;
    modified: Modified;
};

export type Outlets = {
    _id: string;
    name: string;
    branchId: [];
    active: boolean;
    added: Added;
    modified: Modified;
};

export type Suppliers = {
    _id: string;
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
    branches: string[] | null;
    active: boolean;
    created: Added;
    modified: Modified;
};

export type PurchaseFormTypes = {
    _id: string;
    name: string;
    branches: string[] | null,
    active: boolean;
    created: Added,
    modified: Modified
}