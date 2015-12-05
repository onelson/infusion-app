import createBrowserHistory from 'history/lib/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, Link, NoMatch, History } from 'react-router';
import { Provider } from 'react-redux';

import store from './afc/store';
import { ActionCreators } from './afc/actions';
import pages from 'afc/pages';

const App = React.createClass({
  displayName: 'App',
  mixins: [History],
  propTypes: {
    children: React.PropTypes.object.isRequired
  },
  render () {
    return (
      <Provider store={store}>
          {this.props.children}
      </Provider>);
  }
});

const routes = (
  <Route path="/" component={App}>
    <IndexRoute name="gear"
                component={pages.UserDetail}/>
    <Route name="item-detail"
           path="/gear/:itemId"
           component={pages.ItemDetail}/>
    <Route name="login"
           path="/login"
           component={pages.Login}/>
    <Route name="logout"
           path="/logout"
           component={pages.Logout}/>
    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  ReactDOM.render(<Router history={history}>{routes}</Router>, element);
};
