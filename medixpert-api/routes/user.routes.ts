import {
    Router,
  } from 'express';
import {
  logOut,
    login,
  } from '../services/user.service';
import * as validation from '../validation/user.validation';
import validate from '../validation';
import { userAccess } from '../helpers/constants';
import { authenticate } from '../helpers/jwt';
  
  const { task, user, report } = userAccess;
  
  const userRoute = Router();
  
  userRoute.post('/login', validation.login(), validate, login);
  userRoute.use(authenticate);
  userRoute.put('/logout', validate, logOut);

//   userRoute.post('/refresh', validation.refresh(), validate, refreshToken);

//   userRoute.put('/logout', validate, logOut);
  
//   userRoute.get('/', validateMinUserAccess([task, user, report]), validation?.getUsers(), validate, getUsers);
//   userRoute.get('/all-clients', validateMinUserAccess([task, user]), validation?.getUsers(), validate, getAllClients);
  
//   userRoute.post('/', validateUserAccess([user]), validate, upload.fields([{ name: 'document' }]), createUser);
//   userRoute.put('/:id', validateUserAccess([user]), validation.updateUser(), validate, upload.fields([{ name: 'document' }]), updateUser);
//   userRoute.delete('/:id', validateUserAccess([user]), validation.deleteUser(), validate, deleteUser);
  
export = userRoute;
  