import createBrowserHistory from 'history/lib/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, Link, NoMatch, History } from 'react-router';
import { Provider } from 'react-redux';

import store from './afc/store';
import { ActionCreators } from './afc/actions';
import pages from './afc/pages';

import { NavBar, GearList, GearDetail } from './afc/components';

const App = React.createClass({
  displayName: 'App',
  mixins: [History],
  propTypes: {
    children: React.PropTypes.object
  },
  render () {
    return (
      <Provider store={store}>
        <div>
          <NavBar/>
          <div className="grid-container">
          {this.props.children}
          </div>
        </div>
      </Provider>
    );
  }
});

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={pages.Activities} />

    <Route path="gear" component={pages.Gear}>
      <IndexRoute component={GearList}/>
      <Route path="item/:itemId" component={GearDetail}/>
    </Route>

    <Route path="login"
           component={pages.Login}/>
    <Route path="logout"
           component={pages.Logout}/>

    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  ReactDOM.render(<Router history={history}>{routes}</Router>, element);
};
