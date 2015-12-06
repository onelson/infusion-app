import createBrowserHistory from 'history/lib/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, Link, NoMatch, History } from 'react-router';
import { Provider } from 'react-redux';

import store from './afc/store';
import { ActionCreators } from './afc/actions';
import pages from './afc/pages';
import NavBar from './afc/components/navbar';

const App = React.createClass({
  displayName: 'App',
  mixins: [History],
  propTypes: {
    header: React.PropTypes.object,
    main: React.PropTypes.object
  },
  render () {
    return (
      <Provider store={store}>
        <div>
          {this.props.header || ''}
          <div className="grid-container">
          {this.props.main || ''}
          </div>
        </div>
      </Provider>
    );
  }
});

const routes = (
  <Route path="/" component={App}>
    <IndexRoute components={{ main: pages.Activities, header: NavBar }} />
    <Route path="gear"
           components={{ main: pages.UserDetail, header: NavBar }}/>
    <Route path="gear/item/:itemId"
           components={{ main: pages.ItemDetail, header: NavBar }}/>

    <Route path="login"
           components={{ main: pages.Login, header: NavBar }}/>
    <Route path="logout"
           component={pages.Logout}/>

    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  ReactDOM.render(<Router history={history}>{routes}</Router>, element);
};
