import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import classNames from 'classnames';
import { History } from 'react-router';
import request from 'superagent';


/** little placeholder handler for pages that are still TODO */
class Todo extends React.Component {
  render() {
    return (<div>TODO</div>);
  }
}

const PSN = "psn";
const Xbox = "xbox";

const Platforms = {
  PSN,
  Xbox
};


const LoginForm = React.createClass({
  mixins: [LinkedStateMixin, History],
  getInitialState() {
    return {
      username: "",
      password: "",
      platform: Platforms.PSN,
      error: false
    }
  },
  changePlatform(platform) {
    const form = this;
    return function() {
      form.setState({platform: platform});
    };
  },
  onSubmit(event) {
    event.preventDefault();
    const { username, password, platform } = this.state;
    request
        .post(`/bng/auth/login`)
        .send({username, password, platform})
        .end((err, resp) => {
          if(err) {
            this.setState({error: true});
          } else {
            this.history.pushState(null, "/");
          }

        });
  },
  render() {
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
            <input type="submit" value="Search" className="button" />
          </form>
          {this.state.error ? <p>Aww, snap! Login failed!</p> : ''}
        </div>
    );
  }
});


const GearTiles = React.createClass({
  getDefaultProps() {
    return {
      items: [],
      iconPrefix: "https://www.bungie.net"
    };
  },
  render() {
    return (
        <ul>
          { this.props.items.map(i => (
              <li key={i.itemHash}>
                <img title={i.itemName} src={`${this.props.iconPrefix}${i.icon}`}/>
              </li>)) }
        </ul>
    );

  }
});


const Gearset = React.createClass({
  getDefaultProps() {
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
  render() {
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


const UserDetail = React.createClass({
  ignoreLastFetch: false,

  getInitialState() {
    return {gearsets: []};
  },

  componentDidMount () {
    this.fetchInventory();
  },

  componentDidUpdate () {
      this.fetchInventory();
  },

  componentWillUnmount () {
    this.ignoreLastFetch = true
  },

  fetchInventory () {
    request.get("/bng/gear", (err, resp) => {
      console.debug(resp);
      if (!this.ignoreLastFetch) {
        //const gearsets = resp.body.toons.concat(resp.body.vault);
        //this.setState({ gearsets: gearsets });
      }
    });

  },

  render() {
    return (
        <div>
          <h1>Gear</h1>
          <ul>
            {this.state.gearsets.map(x => (<li><Gearset props={x} key={x.owner}/></li>))}
          </ul>
          <pre>{JSON.stringify(this.state, 2)}</pre>
        </div>
    );
  }
});


const Login = React.createClass({
  render() {
    return (
          <LoginForm/>
    );
  }
});


export default {
  pages: {
    Login: Login,
    UserDetail: UserDetail
  }
};
