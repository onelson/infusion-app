import classNames from 'classnames';
import request from 'superagent';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { History } from 'react-router';
import { connect } from 'react-redux'
import { ActionCreators } from './actions';

function mapStateToProps(state) {
  return {
    loginFailure: state.loginFailure,
    user: state.user,
    gearsets: state.gearsets
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loggedIn: (user) => dispatch(ActionCreators.loggedIn(user)),
    loginFailed: (reason) => dispatch(ActionCreators.loginFailed(reason)),
    logout: () => dispatch(ActionCreators.logout()),
    gearFetched: (gearsets) => dispatch(ActionCreators.gearFetched(gearsets))
  }
}

const wireToStore = (component) => connect(mapStateToProps, mapDispatchToProps)(component);

const PSN = "psn";
const Xbox = "xbox";

const Platforms = {
  PSN,
  Xbox
};

const LoginForm = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps () {
    return {
      doLogin: function(username, password, platform) {}
    };
  },
  getInitialState () {
    return {
      username: "",
      password: "",
      platform: Platforms.PSN,
      error: false
    }
  },
  changePlatform (platform) {
    const form = this;
    return function() {
      form.setState({platform: platform});
    };
  },
  onSubmit (event) {
    event.preventDefault();
    const { username, password, platform } = this.state;
    this.props.doLogin(username, password, platform);
  },
  render () {
    return (
        <div>
          <h2>Load your gear.</h2>
          <form onSubmit={this.onSubmit} className="inline-label">
            <ul className="button-group secondary segmented">
              <li className={classNames({"is-active": this.state.platform === Platforms.PSN})}>
                <a href="#"
                   onClick={this.changePlatform(Platforms.PSN)}>PSN</a></li>
              <li className={classNames({"is-active": this.state.platform === Platforms.Xbox})}>
                <a href="#"
                   className={classNames({"is-active": this.state.platform === Platforms.Xbox})}
                   onClick={this.changePlatform(Platforms.Xbox)}>XBox</a></li>
            </ul>
            <input type="text" valueLink={this.linkState("username")} placeholder="username"/>
            <input type="password" valueLink={this.linkState("password")} placeholder="password"/>
            <input type="submit" value="Login" className="button" />
          </form>
          {this.state.error ? <p>Aww, snap! Login failed!</p> : ''}
        </div>
    );
  }
});

const GearTiles = React.createClass({
  getDefaultProps () {
    return {
      items: [],
      iconPrefix: "https://www.bungie.net"
    };
  },
  render () {
    return (
        <ul>
          { this.props.items.map(i => (
              <li key={i.summary.itemId}>
                <img title={i.itemName} src={`${this.props.iconPrefix}${i.icon}`}/>
              </li>)) }
        </ul>
    );
  }
});

const Gearset = React.createClass({
  getDefaultProps () {
    return {
      owner: "",
      helmet: [],
      chest: [],
      arms: [],
      boots: [],
      classItem: [],
      artifact: [],
      primaryWeapon: [],
      specialWeapon: [],
      heavyWeapon: [],
      ghost: []
    };
  },
  render () {
    return (
        <div className="gearset">
          <h1>Gearset: {this.props.owner}</h1>
          <dl>
            <dt><h2>Helm</h2></dt>
            <dd><GearTiles items={this.props.helmet}/></dd>
            <dt><h2>Chest</h2></dt>
            <dd><GearTiles items={this.props.chest}/></dd>
            <dt><h2>Arms</h2></dt>
            <dd><GearTiles items={this.props.arms}/></dd>
            <dt><h2>Boots</h2></dt>
            <dd><GearTiles items={this.props.boots}/></dd>
            <dt><h2>Class Item</h2></dt>
            <dd><GearTiles items={this.props.classItem}/></dd>
            <dt><h2>Artifact</h2></dt>
            <dd><GearTiles items={this.props.artifact}/></dd>
            <dt><h2>Primary</h2></dt>
            <dd><GearTiles items={this.props.primaryWeapon}/></dd>
            <dt><h2>Special</h2></dt>
            <dd><GearTiles items={this.props.specialWeapon}/></dd>
            <dt><h2>Heavy</h2></dt>
            <dd><GearTiles items={this.props.heavyWeapon}/></dd>
            <dt><h2>Ghost</h2></dt>
            <dd><GearTiles items={this.props.ghost}/></dd>
          </dl>
        </div>
    );
  }
});

const UserDetail = wireToStore(React.createClass({
  mixins: [History],
  fetchGear () {
    request
        .get(`/bng/gear/${this.props.user.platform}/${this.props.user.membershipId}`)
        .end((err, resp) => {
          this.props.gearFetched(resp.body.gearsets)
        });
  },
  componentDidMount () {
    if (!this.props.user) {
      this.history.pushState(null, '/login');
    } else {
      this.fetchGear();
    }
  },
  render () {
    return (
        <div>
          <h1>Gear</h1>
          <ul>
            {this.props.gearsets.map(x => (<li key={x.owner}><Gearset {...x}/></li>))}
          </ul>
        </div>
    );
  }
}));

const Login = wireToStore(React.createClass({
  mixins: [History],
  authenticate (username, password, platform) {
    request
        .post('/bng/auth/login')
        .send({username, password, platform})
        .end((err, resp) => {
          if (err) {
            this.props.loginFailed(`Login Failed: ${resp.text}`);
          } else {
            this.props.loggedIn({
              membershipId: resp.body.membershipId,
              displayName: resp.body.displayName,
              platform
            });
            this.history.pushState(null, "/");
          }
        });
  },
  render () {
    return (
        <div>
          <LoginForm doLogin={this.authenticate}/>
          {this.props.loginFailure ? (<p>Aww snap! {this.props.loginFailure}</p>) : ''}
        </div>
    );
  }
}));

const Logout = wireToStore(React.createClass({
  mixins: [History],
  doLogout() {
    this.props.logout();
    this.history.pushState(null, '/login');
  },
  componentDidMount() {
    this.doLogout();
  },
  componentWillReceiveProps() {
    this.doLogout();
  },
  render: () => (<div>Cya!</div>)
}));

export default {
  pages: {
    Login: Login,
    Logout: Logout,
    UserDetail: UserDetail
  }
};
