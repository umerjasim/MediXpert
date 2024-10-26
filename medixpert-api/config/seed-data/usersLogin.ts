import { ObjectId } from "mongodb";
import { UsersLogin } from "../dbTypes";
import { defaultPassword, defaultUsername } from "../../helpers/constants";

export const usersLogin: UsersLogin[] = [
    { 
        _id: new ObjectId(), 
        username: defaultUsername, 
        password: defaultPassword,
        active: true,
        roleId: null,
        loginAttempts:{
            count: 0,
            lastDate: null
        },
        created: {
            on: new Date().toLocaleString(),
            by: 'system',
            date: new Date()
        },
        modified: {
            on: null,
            by: null,
            date: null
        }
    },
];