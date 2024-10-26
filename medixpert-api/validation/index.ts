import { validationResult } from 'express-validator';
import { requestCode } from '../helpers/constants';
import { UserRequest } from '../helpers/jwt';

const validate = (req:UserRequest, res:any, next:any) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(requestCode.BAD_REQUEST).send({ error: errors.array()[0].msg });
};

export default validate;
