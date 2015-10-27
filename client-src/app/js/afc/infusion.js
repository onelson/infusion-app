'use strict';

const React = require('react/addons');
const classNames = require('classnames');
const { History } = require('react-router');
const request = require('superagent');
const alt = require("./alt");


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


const SearchForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin, History],
  getInitialState() {
    return {
      playerName: "",
      platform: Platforms.PSN,
      notFound: false
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
    request
        .get(`/bng/player-search/${this.state.platform}/${this.state.playerName}`)
        .end((err, resp) => {
          if(err && err.status === 404) {
            this.setState({notFound: true});
          } else if (err) {
            // TODO
          } else {
            this.history.pushState(
                {userId: resp.body.membershipId},
                `/guardian/${this.state.platform}/${resp.body.displayName}`);
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
            <input type="text" valueLink={this.linkState("playerName")} placeholder="Gamertag"/>
            <input type="submit" value="Search" className="button" />
          </form>
          {this.state.notFound ? <p>Aww, snap! We couldn't find your guardian.</p> : ''}
        </div>
    );
  }
});


const FindPlayer = React.createClass({
  render() {
    return <SearchForm/>;
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

  componentDidUpdate (prevProps) {
    const oldName = prevProps.params.playerName;
    const newName = this.props.params.playerName;
    const oldPlatform = prevProps.params.platform;
    const newPlatform = this.props.params.platform;
    if (newName !== oldName || newPlatform!== oldPlatform) {
      this.fetchInventory();
    }

  },

  componentWillUnmount () {
    this.ignoreLastFetch = true
  },

  fetchInventory () {
    this.request = request.get(
        `/bng/inventory/${this.props.params.platform}/${this.props.params.playerName}`,
        (err, resp) => {
          if (!this.ignoreLastFetch) {
            const gearsets = resp.body.toons.concat(resp.body.vault)
            this.setState({ gearsets: gearsets });
          }
        })
  },


  render() {
    return (
        <ul>
          {this.state.gearsets.map(gs => (
              <li key={gs.owner}>
                <Gearset {...gs} />
              </li>
          ))}
        </ul>
    );
  }
});


const AltContainer = require('alt/AltContainer');
const AuthStore = require("./stores/auth");
const AuthActions = require("./actions/auth");

const Derp = React.createClass({

  getInitialState() {
    return {
      errorMessage: null,
      identity: null
    }
  },

  componentDidMount() {
    AuthActions.fetchIdentity();
  },

  render() {
    if (this.state.errorMessage) {
      return (
          <div>Something is wrong</div>
      );
    }

    if (!this.state.player) {
      const serialize = function(obj) {
        const parts = [];
        for(var p in obj)
          if (obj.hasOwnProperty(p)) {
            parts.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return parts.join("&");
      };

      const params = serialize({
        response_type: "code",
        client_id: "78420c74-1fdf-4575-b43f-eb94c7d770bf",
        redirect_uri: "https://www.bungie.net/en/User/SignIn/Psnid",
        scope: "psn:s2s",
        locale: "en"
      });

      const url = `https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/authorize?${params}}`;

      return (
          <div>
            <p>Please login at <a href="https://bungie.net" target="_bungie">Bungie.net</a></p>
          </div>
      )
    }

    return (
        <pre>{JSON.stringify(this.state.player, 2)}</pre>
    );
  }
});

const Derpity = React.createClass({
  render() {
    return (
        <AltContainer store={AuthStore}>
          <Derp />
        </AltContainer>
    );
  }
});


module.exports = {
  pages: {
    FindPlayer: Derpity,
    UserDetail
  }
};
