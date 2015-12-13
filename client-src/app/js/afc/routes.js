import React from 'react';
import { IndexRoute, Router, Route, Link, NoMatch, History } from 'react-router';
import pages from './pages';
import { GearList, GearDetail } from './components';
import AppContainer from './app-container';

const routes = (
  <Route path="/" component={AppContainer}>
    <IndexRoute component={pages.Activities} />
    <Route path="gear" component={pages.Gear}>
      <IndexRoute component={GearList}/>
      <Route path="item/:itemId" component={GearDetail}/>
    </Route>
    <Route path="login" component={pages.Login}/>
    <Route path="logout" component={pages.Logout}/>
    <Route path="*" component={NoMatch}/>
  </Route>
);

export default routes;
