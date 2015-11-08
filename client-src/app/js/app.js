import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, Link, NoMatch } from 'react-router';
import { History } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { user, gearsets, initialState, loginFailure } from './afc/reducers';
import { ActionCreators } from './afc/actions';
import infusion from 'afc/infusion';

const rootReducer = combineReducers({ loginFailure, user, gearsets });
const store = createStore(rootReducer, initialState);

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
);

const App = React.createClass({
  mixins: [History],
  propTypes: {
    children: React.PropTypes.object.isRequired
  },
  render () {
    return (
      <Provider store={store}>
        <div>
          <div className="title-bar">
            <span className="left title"><Link to="/">Infusion Solver</Link></span>
          </div>
          {this.props.children}
        </div>
      </Provider>);
  }
});

const routes = (
  <Route path="/" component={App}>
    <IndexRoute name="gear" component={infusion.pages.UserDetail}/>
    <Route name="login"
           path="/login"
           component={infusion.pages.Login}/>
    <Route name="logout"
           path="/logout"
           component={infusion.pages.Logout}/>

    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  ReactDOM.render(<Router history={history}>{routes}</Router>, element);
};
