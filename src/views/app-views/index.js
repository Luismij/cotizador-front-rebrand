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
  }, [])

  if (!user) {
    return (<Loading cover='content' />)
  }

  return (
    <Suspense fallback={<Loading cover="content" />}>
      <Switch>
        <Route path={`${APP_PREFIX_PATH}/customers`} component={lazy(() => import(`./customers`))} />
        <Route path={`${APP_PREFIX_PATH}/addcustomer`} component={lazy(() => import(`./addCustomer`))} />
        <Route path={`${APP_PREFIX_PATH}/editcustomer/:customerid`} component={lazy(() => import(`./editCustomer`))} />
        <Route path={`${APP_PREFIX_PATH}/addquote`} component={lazy(() => import(`./addQuote`))} />
        <Route path={`${APP_PREFIX_PATH}/addmarking`} component={lazy(() => import(`./addMarking`))} />
        <Route path={`${APP_PREFIX_PATH}/markings`} component={lazy(() => import(`./markings`))} />
        <Route path={`${APP_PREFIX_PATH}/changepassword`} component={lazy(() => import(`./passwordChange`))} />
        <Redirect from={`${APP_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}/customers`} />
      </Switch>
    </Suspense>
  )
}

export default React.memo(AppViews);