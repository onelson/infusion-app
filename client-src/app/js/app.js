import React from 'react';
import ReactDOM from 'react-dom';
import { ReduxRouter } from 'redux-router';
import { IndexRoute, Router, Route, Link, NoMatch, History } from 'react-router';
import { Provider } from 'react-redux';

import store from './afc/store';

const App = React.createClass({
  displayName: 'App',
  render () {
    return (
      <Provider store={store}>
        <ReduxRouter/>
      </Provider>
    );
  }
});

global.initApp = function (element) {
  ReactDOM.render(<App/>, element);
};
