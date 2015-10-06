'use strict';

const React = require('react/addons');
const classNames = require('classnames');
const { History } = require('react-router');
const request = require('superagent');



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
        .get(`${global.BACKEND_HOST || ''}/bng/player-search/${this.state.platform}/${this.state.playerName}`)
        .end((err, resp) => {
          if(err && err.status === 404) {
            this.setState({notFound: true});
          } else if (err) {
            // TODO
          } else {
            this.history.pushState(
                {userId: resp.body.membershipId},
                `/guardian/${resp.body.membershipId}/${resp.body.displayName}`);
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

const UserDetail = React.createClass({
  render() {
    return (
      <div>
        <pre>{JSON.stringify(this.props.params, 4)}</pre>
      </div>);
  }
});


module.exports = {
  pages: {
    FindPlayer,
    UserDetail
  }
};
