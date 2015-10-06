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
      platform: Platforms.PSN
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
    // TODO: query backend and get user id from bungie
    this.history.pushState({userId: 'XXX'}, `/guardian/${this.state.playerName}`);
  },
  render() {
   return (
       <form onSubmit={this.onSubmit}>
         <ul className="button-group secondary segmented">
           <li className={classNames({"is-active": this.state.platform === Platforms.PSN})}>
             <a href="#"
                  onClick={this.changePlatform(Platforms.PSN)}>PSN</a></li>
           <li className={classNames({"is-active": this.state.platform === Platforms.Xbox})}>
             <a href="#"
                  className={classNames({"is-active": this.state.platform === Platforms.Xbox})}
                  onClick={this.changePlatform(Platforms.Xbox)}>XBox</a></li>
         </ul>
         <input type="text" valueLink={this.linkState("playerName")}/>
         <input type="submit" value="Search" className="button" />
       </form>
   );
  }
});


const FindPlayer = React.createClass({
  render() {
    return <SearchForm/>;
  }
});


module.exports = {
  pages: {
    FindPlayer,
    UserDetail: Todo
  }
};
