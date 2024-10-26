import { ObjectId } from "mongodb";

export type errorType = {
    code: number,
    message: string,
}

export type User = {
    userId: ObjectId;
    title: string | null;
    name: object | null;
    dob: string | null;
    picture: string | null;
    access: Array<[number]>;
    accessPages: Array<ObjectId>;
    roleId: ObjectId;
    roleName: string;
    branch: ObjectId;
    outlet: ObjectId;
}

export type JwtToken = {
    userId: number;
    token: ObjectId;
    refreshToken: ObjectId;
}

