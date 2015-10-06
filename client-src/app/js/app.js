'use strict';

const React = require('react');
const connectToStores = require('alt/utils/connectToStores');
const { IndexRoute, Router, Route, Link, NoMatch } = require('react-router');
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
      </div>
    );
  }
}


const routes = (
  <Route path="/" component={App}>
    <IndexRoute name="findPlayer" component={infusion.pages.FindPlayer}/>
    <Route name="userDetail" path="/guardian/:userId" component={infusion.pages.UserDetail}/>
    <Route path="*" component={NoMatch}/>
  </Route>);

global.initApp = function (element) {
  const history = createBrowserHistory();
  React.render(<Router history={history}>{routes}</Router>, element);
};
