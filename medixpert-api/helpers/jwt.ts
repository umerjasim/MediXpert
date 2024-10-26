import jwt from 'jsonwebtoken';
import { JwtToken, User } from "./types";
import { collectionNames, msg, requestCode, tokenExpiryTime } from './constants';
import { NextFunction, Response, Request } from 'express';
import { geti18nResponse } from '../i18n';
import { ObjectId } from 'mongodb';
import { dbHandler } from '../config/dbConfig';
import { checkBranchAndOutletAccess } from '../services/user.service';

export interface UserRequest extends Request {
    user: User;
    access: [ObjectId]
};

export function createToken(
    user: User,
  ): string {
    // const access = [...new Set(user.access.flat(1))];
    return jwt.sign({
      userId: user.userId,
      title: user.title,
      name: user.name,
      accessPages: user.accessPages,
      dob: user.dob,
      picture: user.picture,
      roleId: user.roleId,
      roleName: user.roleName,
      branch: user.branch,
      outlet: user.outlet,
      expiryTime: Date.now() + tokenExpiryTime,
    }, process.env.JWT_SECRET);
};

export function createRefreshToken(
    user: User,
  ): string {
    return jwt.sign({
      userId: user.userId,
      expiryTime: Date.now() + tokenExpiryTime,
    }, process.env.JWT_REFRESH_SECRET);
};

export function authenticate(
  req: UserRequest,
  res: Response,
  next: NextFunction,
): Response | void | any {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    return jwt.verify(
      token,
      process.env.JWT_SECRET,
      async (errorResponse: Error, user: User) => {
        if (errorResponse) {
          return res.status(requestCode.FORBIDDEN).send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
        }
        const tokenData = await getTokenData(token, user);
        if (tokenData?.length === 0) {
          return res.status(requestCode.FORBIDDEN).send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
        }
        return performNext(req, res, next, user, token);
      },
    );
  }
  return res.status(requestCode.FORBIDDEN).send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
};

export async function getTokenData(token: string, user: User) {
  const tokens: JwtToken[] = await dbHandler(
    collectionNames.jwtToken, 
    'find', 
    { token }, 
    { userId: 1, token: 1, refreshToken: 1 }
  );

  return tokens;
};

async function performNext(
  req: UserRequest,
  res: Response,
  next: NextFunction,
  user: User,
  token: string,
) {
  const userDetails = await getUserData(user);

  if (userDetails) {
    const isValidUser = checkValidUser(user);
    if (isValidUser) {
      const branchAndOutletAccess = await checkBranchAndOutletAccess(
        new ObjectId(user.userId), user.branch, user.outlet
      );
      if (branchAndOutletAccess.success) {
        const tokenData = await getTokenData(token, user);
        if (tokenData) {
          req.user = userDetails;
          return next();
        }
        return res.status(requestCode.FORBIDDEN)
          .send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
      }
      return res.status(requestCode.FORBIDDEN)
          .send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
    }
    return res.status(requestCode.FORBIDDEN)
          .send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
  }
  return res.status(requestCode.FORBIDDEN)
    .send({ error: geti18nResponse(req, 'forbidden', msg.forbidden) });
};

export async function getUserData(user: User) {
  const userDetailsArray = await dbHandler(
    collectionNames.users, 
    'aggregate', 
    [
      {
        $match: { 
            userId: new ObjectId(user.userId),
            active: true 
        }
      },
      {
        $lookup: {
          from: collectionNames.titles,
          localField: 'titleId',
          foreignField: '_id',
          as: 'titleDetails'
        }
      },
      {
        $unwind: {
          path: '$titleDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userId: 1,
          name: 1,
          dob: 1,
          'picture': {
            $cond: { 
                if: { $eq: ['$picture.filePath', null] }, 
                then: null, 
                else: '$picture.filePath' 
            }
          },
          title: {
            $cond: { 
              if: { $ifNull: ['$titleDetails._id', null] }, 
              then: '$titleDetails.name', 
              else: null 
            }
          }
        }
      }
    ]
  );

  if (userDetailsArray.length === 1) {
    const usersRole = await dbHandler(
      collectionNames.usersRole, 
      'findOne', 
      { 
        _id: new ObjectId(user.roleId)
      }
    );

    if (usersRole) {
      userDetailsArray[0].roleId = usersRole._id;
      userDetailsArray[0].roleName = usersRole.name;
      const userAccessArray: Array<ObjectId> = usersRole.access;

      const accessPages: Array<object> = await dbHandler(collectionNames.mainPages, 'find', 
          { 
              _id: { $in: userAccessArray },
              active: true
          },
          {
              projection: {
                  name: 1,
                  title: 1,
                  route: 1
              }
          }
      );
      userDetailsArray[0].accessPages = accessPages;
      
      if (userDetailsArray?.length === 1) {
        userDetailsArray[0].branch = user.branch;
        userDetailsArray[0].outlet = user.outlet;
        const userDetails = userDetailsArray[0] as User;
        return userDetails;
      }
      return null;
    }
    return null
  }

  return null;
};

export async function checkValidUser(user: User) {
  const usersLogin = await dbHandler(
    collectionNames.usersLogin, 
    'findOne', 
    { _id: user.userId, active: true }
  );
  return !!usersLogin;
};

export function validateUserAccess(routes: Array<string>) {
  return async (
    req: UserRequest,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    const { userId, roleId, branch, outlet } = req.user;
    if (userId && roleId) {
      const user = await dbHandler(
        collectionNames.usersLogin,
        'findOne',
        { _id: new ObjectId(userId), active: true },
        { _id: 1 }
      );
      if (user) {
        const roleAccess = await dbHandler(
          collectionNames.usersRole,
          'findOne',
          { _id: new ObjectId(roleId), active: true },
          {
            access: 1
          }
        );
        const mainPages: Array<object> = await dbHandler(
          collectionNames.mainPages, 
          'find', 
            { 
                _id: { $in: roleAccess.access },
                active: true,
            },
            {
                projection: {
                    name: 1,
                    title: 1,
                    route: 1
                }
            }
        );
        const subPages: Array<object> = await dbHandler(
          collectionNames.subPages, 
          'find', 
            { 
                _id: { $in: roleAccess.access },
                active: true
            },
            {
                projection: {
                    name: 1,
                    title: 1,
                    route: 1
                }
            }
        );
    
        const pagesMap = new Map<string, any>();
        [...mainPages, ...subPages].forEach((page: any) => {
          pagesMap.set(page._id.toString(), page);
        });
        const pages = Array.from(pagesMap.values());
        const accessCheck = routes.every(route =>
          pages.some(page => page.route === route)
        );
        
        if (accessCheck) {
          const branchOutletAccess = await dbHandler(
            collectionNames.usersAccess,
            'findOne',
            { 
              userId,
              branches: { $in: [ new ObjectId(branch) ] },
              outlets: { $in: [ new ObjectId(outlet) ] },
              active: true 
            }
          );
          if (branchOutletAccess) {
            return next();
          }
          return res.status(requestCode.UNAUTHORIZED)
            .send({ error: geti18nResponse(req, 'unauthorisedAccess', msg.unauthorisedAccess) });
        }
        return res.status(requestCode.UNAUTHORIZED)
            .send({ error: geti18nResponse(req, 'unauthorisedAccess', msg.unauthorisedAccess) });
      }
      return res.status(requestCode.UNAUTHORIZED)
            .send({ error: geti18nResponse(req, 'unauthorisedAccess', msg.unauthorisedAccess) });
    }
    return res.status(requestCode.UNAUTHORIZED)
          .send({ error: geti18nResponse(req, 'unauthorisedAccess', msg.unauthorisedAccess) });
  };
}