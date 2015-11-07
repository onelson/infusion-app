import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, Link, NoMatch } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { user, gearsets, initialState} from './afc/reducers';
import infusion from 'afc/infusion';

const createStoreWithMiddleware = applyMiddleware(
    thunk
)(createStore);

const rootReducer = combineReducers({ user, gearsets });
const store = createStoreWithMiddleware(rootReducer, initialState);

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
);

class App extends React.Component {
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
}

App.propTypes = {
  children: React.PropTypes.object.isRequired
};

const routes = (
  <Route path="/" component={App}>
    <IndexRoute name="gear" component={infusion.pages.UserDetail}/>
    <Route name="login"
           path="/login"
           component={infusion.pages.Login}/>

    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  ReactDOM.render(<Router history={history}>{routes}</Router>, element);
};
