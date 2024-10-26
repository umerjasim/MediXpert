import accessPagesRoute from './accessPages.routes';
import branchRoute from './branch.routes';
import itemRoute from './item.routes';
import loginRoute from './login.routes';
import outletRoute from './outlet.routes';
import purchaseEnryRoute from './purchaseEntry.routes';
import supplierRoute from './supplier.routes';
import taxRoute from './tax.routes';
import userRoute from './user.routes';

const routes = (app: any) => {
  app.use('/user', userRoute);
  app.use('/accessPages', accessPagesRoute);
  app.use('/item', itemRoute);
  app.use('/login', loginRoute);
  app.use('/supplier', supplierRoute);
  app.use('/branch', branchRoute);
  app.use('/tax', taxRoute);
  app.use('/outlet', outletRoute);
  app.use('/purchase-entry', purchaseEnryRoute);
};

export default routes;
