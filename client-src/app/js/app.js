'use strict';

const React = require('react');
const connectToStores = require('alt/utils/connectToStores');
const { Router, Route, Link, NoMatch } = require('react-router');
const createBrowserHistory = require('history/lib/createBrowserHistory');
const infusion = require('afc/infusion');


@connectToStores
class App extends React.Component {

  static getStores() {
    return [];
  }
  static getPropsFromStores() {
    return {};
  }
  render() {

    return (
      <div>
        <div className="title-bar">
          <span className="left title">Infusion Solver</span>
        </div>
        {this.props.children}
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}


const routes = (
  <Route path="/" component={App}>
    <Route name="userDetail" path="/user/:provider/:userId" component={infusion.pages.UserDetail}/>
    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  React.render(<Router history={history}>{routes}</Router>, element);
};
