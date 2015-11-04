'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, Link, NoMatch } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import infusion from 'afc/infusion';


class App extends React.Component {
  render() {

    return (
      <div>
        <div className="title-bar">
          <span className="left title"><Link to="/">Infusion Solver</Link></span>
        </div>
        {this.props.children}
      </div>
    );
  }
}


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
