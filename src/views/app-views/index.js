import React, { lazy, Suspense, useEffect, useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from 'components/shared-components/Loading';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig'
import { UserContext } from 'contexts/UserContext';
import { useHistory } from "react-router";

export const AppViews = () => {
  const { user } = useContext(UserContext)
  const history = useHistory()

  useEffect(() => {
    if (!user) history.push(AUTH_PREFIX_PATH + '/login');// eslint-disable-next-line
  }, [user])

  if (!user) {
    return (<Loading cover='content' />)
  }

  return (
    <Suspense fallback={<Loading cover="content" />}>
      <Switch>
        <Route path={`${APP_PREFIX_PATH}/edituser`} component={lazy(() => import(`./editUser`))} />
        <Route path={`${APP_PREFIX_PATH}/customers`} component={lazy(() => import(`./customers`))} />
        <Route path={`${APP_PREFIX_PATH}/addcustomer`} component={lazy(() => import(`./customers/addCustomer`))} />
        <Route path={`${APP_PREFIX_PATH}/editcustomer/:customerid`} component={lazy(() => import(`./customers/editCustomer`))} />
        <Route path={`${APP_PREFIX_PATH}/quotes`} component={lazy(() => import(`./quote`))} />
        <Route path={`${APP_PREFIX_PATH}/addquote`} component={lazy(() => import(`./quote/addQuote`))} />
        <Route path={`${APP_PREFIX_PATH}/editquote/:quoteid`} component={lazy(() => import(`./quote/editQuote`))} />
        <Route path={`${APP_PREFIX_PATH}/addmarking`} component={lazy(() => import(`./markings/addMarking`))} />
        <Route path={`${APP_PREFIX_PATH}/editmarking/:markingId`} component={lazy(() => import(`./markings/editmarkings`))} />
        <Route path={`${APP_PREFIX_PATH}/markings`} component={lazy(() => import(`./markings`))} />
        <Route path={`${APP_PREFIX_PATH}/changepassword`} component={lazy(() => import(`./passwordChange`))} />
        <Route path={`${APP_PREFIX_PATH}/discount`} component={lazy(() => import(`./discount`))} />
        <Route path={`${APP_PREFIX_PATH}/editdiscount`} component={lazy(() => import(`./discount/editDiscount`))} />
        <Route path={`${APP_PREFIX_PATH}/products`} component={lazy(() => import(`./products`))} />
        <Redirect from={`${APP_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}/customers`} />
      </Switch>
    </Suspense>
  )
}

export default React.memo(AppViews);