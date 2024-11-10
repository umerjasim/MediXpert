import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout, Skeleton, Spin } from "antd";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import AccessRoute from "./AccessRoute";
import RoutesPath from "../Global/Routes";
import MainLayout from "../Layout/Main";
import authStore from "../Store/authStore";
import Constant from "../Global/Constant";
import CustomLoader from "../Components/CustomLoader";
import globalStore from "../Store/globalStore";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";


const Login = lazy(() => import("../Pages/Login"));
const Dashboard = lazy(() => import("../Pages/Dashboard"));
const NoAccess = lazy(() => import("../Pages/NoAccess"));
const Items = lazy(() => import("../Pages/Items"));
const Suppliers = lazy(() => import("../Pages/Suppliers"));
const Taxes = lazy(() => import("../Pages/Taxes"));
const PurchaseEntry = lazy(() => import("../Pages/PurchaseEntry"));
const ApprovePurchaseEntry = lazy(() => import("../Pages/ApprovePurchaseEntry"));
const Sale = lazy(() => import("../Pages/Sale"));

const { Header, Content } = Layout;

const getaccessRoute = () => {
  const currentUser = authStore?.currentUser;
  let redictTo = RoutesPath.login;
  if (currentUser) {
    redictTo = authStore.currentUser?.accessPages?.[0]?.route ?? RoutesPath.login;
  }
  return redictTo;
};

const MainComponent = () => {
  return (
    <Layout className="h-100">
      <Spin
        spinning={globalStore.loading}
        className="gm-spin-center"
        indicator={<CustomLoader />}
        fullscreen
      />
      <Layout>
        <MainLayout>
          <Content>
            <Routes>
              <Route index element={<Navigate to={getaccessRoute()} replace />} />
              <Route path={RoutesPath.noAccess} element={<NoAccess />} />
              <Route path={RoutesPath.dashboard} element={<AccessRoute access={RoutesPath.dashboard}><Dashboard /></AccessRoute>} />
              <Route path={RoutesPath.items} element={<AccessRoute access={RoutesPath.items}><Items /></AccessRoute>} />
              <Route path={RoutesPath.suppliers} element={<AccessRoute access={RoutesPath.suppliers}><Suppliers /></AccessRoute>} />
              <Route path={RoutesPath.taxes} element={<AccessRoute access={RoutesPath.taxes}><Taxes /></AccessRoute>} />
              <Route path={RoutesPath.purchaseEntry} element={<AccessRoute access={RoutesPath.purchaseEntry}><PurchaseEntry /></AccessRoute>} />
              <Route path={RoutesPath.approvePurchaseEntry} element={<AccessRoute access={RoutesPath.approvePurchaseEntry}><ApprovePurchaseEntry /></AccessRoute>} />
              <Route path={RoutesPath.sale} element={<AccessRoute access={RoutesPath.sale}><Sale /></AccessRoute>} />
              {/* <Route path={RoutesPath.inspections} element={<AccessRoute access={task}><InspectionTask /></AccessRoute>} />
              <Route path={RoutesPath.individualTask + ':id'} element={<AccessRoute access={task}><TaskIndividual /></AccessRoute>} />
              <Route path={RoutesPath.reports} element={<AccessRoute access={report}><Reports /></AccessRoute>} />
              <Route path={RoutesPath.users} element={<AccessRoute access={user}><Users /></AccessRoute>} />
              <Route path={RoutesPath.styleGuide} element={<StyleGuide />} />
              <Route path={RoutesPath.userRole} element={<AccessRoute access={role}><UserRole /></AccessRoute>} />
              <Route path={RoutesPath.equipmentType} element={<AccessRoute access={general}><EquipmentType /></AccessRoute>} />
              <Route path={RoutesPath.equipments} element={<AccessRoute access={equipment}><Equipment /></AccessRoute>} />
              <Route path={RoutesPath.equipmentDetails + ':id'} element={<AccessRoute access={equipment}><EquipmentIndividual /></AccessRoute>} />
              <Route path={RoutesPath.checklist} element={<AccessRoute access={checklist}><CheckList /></AccessRoute>} />
              <Route path={RoutesPath.checklistDetails + ':id'} element={<AccessRoute access={checklist}><CheckListIndividual /></AccessRoute>} />
              <Route path={RoutesPath.statutoryRegulation} element={<AccessRoute access={general}><StatutoryRegulation /></AccessRoute>} />
              <Route path={RoutesPath.insulation} element={<AccessRoute access={general}><Insulation /></AccessRoute>} />
              <Route path={RoutesPath.occasion} element={<AccessRoute access={general}><Occasion /></AccessRoute>} />
              <Route path={RoutesPath.inspectionCode} element={<AccessRoute access={general}><InspectionCode /></AccessRoute>} />
              <Route path={RoutesPath.construction} element={<AccessRoute access={general}><ConstructionCode /></AccessRoute>} />
              <Route path={RoutesPath.tubeType} element={<AccessRoute access={general}><TubeType /></AccessRoute>} />
              <Route path={RoutesPath.ndtType} element={<AccessRoute access={general}><NDTType /></AccessRoute>} />
              <Route path={RoutesPath.vendor} element={<AccessRoute access={general}><Vendor /></AccessRoute>} />
              <Route path={RoutesPath.damageMechanism} element={<AccessRoute access={general}><DamageMechanism /></AccessRoute>} />
              <Route path={RoutesPath.recommendationTags} element={<AccessRoute access={general}><RecommendationTags /></AccessRoute>} />
              <Route path={RoutesPath.correctiveActionTags} element={<AccessRoute access={general}><CorrectiveActionTags /></AccessRoute>} />
              <Route path={RoutesPath.configuration} element={<AccessRoute access={configuration}><Configuration /></AccessRoute>} />
              <Route path={RoutesPath.clients} element={<AccessRoute access={client}><Clients /></AccessRoute>} />
              <Route path={RoutesPath.plants} element={<AccessRoute access={plant}><Plants /></AccessRoute>} />
              <Route path={RoutesPath.dashboard} element={<AccessRoute access={dashboard}><Dashboard /></AccessRoute>} />
              <Route path={RoutesPath.thicknessMaster + ':id'} element={<AccessRoute access={equipment}><ThicknessMaster /></AccessRoute>} />
              <Route path={RoutesPath.analyzedData + ':id'} element={<AccessRoute access={equipment}><AnalyzedData /></AccessRoute>} />
              <Route path={RoutesPath.measuredData + ':id'} element={<AccessRoute access={equipment}><MeasuredData /></AccessRoute>} />
              <Route path={RoutesPath.materials} element={<AccessRoute access={task}><Material /></AccessRoute>} />
              <Route path={RoutesPath.thicknessSummary} element={<AccessRoute access={thicknessSummary}><ThicknessSummary /></AccessRoute>} />
              <Route path={RoutesPath.notFound} element={<NotFound />} /> */}
            </Routes>
          </Content>
        </MainLayout>
      </Layout>
    </Layout>
  );
};

const Router = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(globalStore.language);
  }, [globalStore.language]);

  return (
    <Suspense fallback={
      <Spin
        spinning={globalStore.loading}
        className="gm-spin-center"
        indicator={<CustomLoader />}
        fullscreen
      />
    }>
      <Routes>
        <Route
          path={RoutesPath.login}
          element={
            <PublicRoute>
              <>
                <Spin
                  spinning={globalStore.loading}
                  className="gm-spin-center"
                  indicator={<CustomLoader />}
                  fullscreen
                />
                <Login />
              </>
            </PublicRoute>
          }
        />
        <Route
          path={"*"}
          element={
              <PrivateRoute>
                <Suspense fallback={
                  <Spin
                  spinning={globalStore.loading}
                  className="gm-spin-center"
                  indicator={<CustomLoader />}
                  fullscreen
                  />
              }>
                  <MainComponent />
                </Suspense>
              </PrivateRoute>
          }
        />
        {/* <Route path={RoutesPath.notFound} element={<NotFound />} /> */}
      </Routes>
    </Suspense>
  );
};

export default inject('globalStore')(observer(Router));
