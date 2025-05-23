import accessPagesRoute from './accessPages.routes';
import branchRoute from './branch.routes';
import itemRoute from './item.routes';
import loginRoute from './login.routes';
import outletRoute from './outlet.routes';
import purchaseEnryRoute from './purchaseEntry.routes';
import saleRoute from './sale.routes';
import supplierRoute from './supplier.routes';
import taxRoute from './tax.routes';
import userRoute from './user.routes';
import dashboardRoute from './dashboard.routes';
import designerRoute from './designer.routes';

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
  app.use('/sale', saleRoute);
  app.use('/dashboard', dashboardRoute);
  app.use('/designer', designerRoute);
};

export default routes;
