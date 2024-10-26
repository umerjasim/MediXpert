import { Request, Response } from "express";
import { JWTToken, UsersLogin } from "../config/dbTypes";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import bcrypt from 'bcrypt';
import { dbHandler } from "../config/dbConfig";
import logger from "../helpers/logger";
import { geti18nResponse } from "../i18n";
import { createRefreshToken, createToken } from "../helpers/jwt";
import { ObjectId } from "mongodb";

export async function login(
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
        const { username, password, branch, outlet } = req.body;
        const user = await authenticateUser(username, password);
        if (user) {
          const branchAndOutletAccess = await checkBranchAndOutletAccess(user._id, branch, outlet);
          if (!branchAndOutletAccess?.success) {
            return res.status(requestCode.UNAUTHORIZED)
                    .send({ error: geti18nResponse(req, branchAndOutletAccess?.msgKey, branchAndOutletAccess?.msg) });
          }
            if (user.active) {
                const userDetails = await dbHandler(
                    collectionNames.users, 
                    'aggregate', 
                    [
                      {
                        $match: { 
                            userId: user._id,
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
                  
                if (userDetails) {
                    const usersRole = await dbHandler(collectionNames.usersRole, 'findOne', { _id: user.roleId });
                    userDetails[0].roleId = usersRole._id;
                    userDetails[0].roleName = usersRole.name;
                    const userAccessArray: Array<ObjectId> = usersRole.access;
                    const accessMainPages: Array<object> = await dbHandler(collectionNames.mainPages, 'find', 
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
                    const accessSubPages: Array<object> = await dbHandler(collectionNames.subPages, 'find', 
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

                    const uniquePagesMap = new Map<string, any>();
                    [...accessMainPages, ...accessSubPages].forEach((page: any) => {
                      uniquePagesMap.set(page._id.toString(), page);
                    });
                    const accessPages = Array.from(uniquePagesMap.values());
                    userDetails[0].accessPages = accessPages;

                    if (accessPages) {
                      userDetails[0].branch = new ObjectId(branch);
                      userDetails[0].outlet = new ObjectId(outlet);
                      const token: string = createToken(userDetails[0]);
                      const refreshToken: string = createRefreshToken(userDetails[0]);

                      const jwtToken: JWTToken = {
                        _id: new ObjectId,
                        userId: user._id,
                        token,
                        refreshToken,
                        active: true,
                        created: {
                          by: user._id,
                          on: new Date().toLocaleString(),
                          date: new Date()
                        }
                      };

                      await dbHandler(collectionNames.jwtToken, 'insertOne', jwtToken);
                      await dbHandler(collectionNames.lastLoginLogout, 'createOrUpdate', { 
                        userId: user._id 
                      }, {
                        $set: {
                          loginOn: new Date().toLocaleString(),
                          loginDate: new Date(),
                          logoutOn: null,
                          logoutDate: null,
                        },
                      });

                      return res.status(requestCode.SUCCESS)
                          .send({ token: token, refreshToken, accessPages });
                    }
                    await updateLoginAttempts(username);
                    return res.status(requestCode.UNAUTHORIZED)
                        .send({ error: geti18nResponse(req, 'noAnyAccess', msg.noAnyAccess) });
                }
                await updateLoginAttempts(username);
                return res.status(requestCode.UNAUTHORIZED)
                    .send({ error: geti18nResponse(req, 'inactiveUser', msg.inactiveUser) });
          }
          await updateLoginAttempts(username);
          return res.status(requestCode.UNAUTHORIZED)
              .send({ error: geti18nResponse(req, 'inactiveUser', msg.inactiveUser) });
        }
        await updateLoginAttempts(username);
        return res.status(requestCode.UNAUTHORIZED)
                .send({ error: geti18nResponse(req, 'invalidLogin', msg.invalidLogin) });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

async function authenticateUser(username: string, password: string): Promise<UsersLogin | null> {
    try {
        const user = await dbHandler(collectionNames.usersLogin, 'findOne', { username });
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;

    } catch (error) {
        logger.error(error?.toString());
        return null;
    }
};
export const logOut = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.body?.user;
  const { token } = req.body;
  
  try {
    await dbHandler(
      collectionNames.lastLoginLogout,
      'updateOne',
      { userId },
      {
        $set: {
          logoutOn: new Date().toLocaleString(),
          logoutDate: new Date()
        }
      },
    );
    await dbHandler(
      collectionNames.jwtToken,
      'deleteMany',
      {
        token
      }
    );
    return res.status(requestCode.SUCCESS).send(geti18nResponse(req, 'success', msg.success));
  } catch (error) {
    logger.error(error.stack);
    return res.status(requestCode.SERVER_ERROR)
      .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
  }
};

const updateLoginAttempts = async (username: string) => {
  await dbHandler(collectionNames.usersLogin, 'updateOne', {
    username
  }, {
    $set: {
      'loginAttempts.lastDate': new Date()
    },
    $inc: {
      'loginAttempts.count': 1
    }
  });
};

export async function checkBranchAndOutletAccess(
  userId: ObjectId, 
  branchId: string | ObjectId, 
  outletId: string | ObjectId
): Promise<any> {
  try {
    if (!branchId) {
      return { success: false, msg: msg.branchMandatory, msgKey: 'branchMandatory' };
    }

    if (!outletId) {
      return { success: false, msg: msg.outletMandatory, msgKey: 'outletMandatory' };
    }

    const branchAccess = await dbHandler(
      collectionNames.usersAccess,
      'findOne',
      { 
        userId,
        branches: { $in: [ new ObjectId(branchId) ] },
        active: true 
      }
    );
    
    if (!branchAccess) {
      return { success: false, msg: msg.noBranchAccess, msgKey: 'noBranchAccess' };
    }

    const outletAccess = await dbHandler(
      collectionNames.usersAccess,
      'findOne',
      { 
        userId,
        outlets: { $in: [ new ObjectId(outletId) ] },
        active: true 
      }
    );

    if (!outletAccess) {
      return { success: false, msg: msg.noOutletAccess, msgKey: 'noOutletAccess' };
    }

    return { success: true };
  } catch (error) {
    logger.error(error.stack);
    return { success: false, msg: msg.unknownError, msgKey: 'unknownError' };
  }
}