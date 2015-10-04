'use strict';

const React = require('react/addons');
const classNames = require('classnames');


/** little placeholder handler for pages that are still TODO */
class Todo extends React.Component {
  render() {
    return (<div>TODO</div>);
  }
}

const PSN = "TigerPSN";
const Xbox = "TigerXbox";

const MembershipTypes = {
  PSN,
  Xbox
};


const SearchForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      displayName: "",
      membershipType: MembershipTypes.PSN
    }
  },
  changeMembership(membershipType) {
    const form = this;
    return function() {
      form.setState({membershipType: membershipType});
    };
  },
  onSubmit() {
    // TODO: query backend and get user id from bungie
    this.history.pushState(); // TODO
  },
  render() {
   return (
       <form onSubmit={this.onSubmit}>
         <ul className="button-group secondary segmented">
           <li className={classNames({"is-active": this.state.membershipType === MembershipTypes.PSN})}>
             <a href="#"
                  onClick={this.changeMembership(MembershipTypes.PSN)}>PSN</a></li>
           <li className={classNames({"is-active": this.state.membershipType === MembershipTypes.Xbox})}>
             <a href="#"
                  className={classNames({"is-active": this.state.membershipType === MembershipTypes.Xbox})}
                  onClick={this.changeMembership(MembershipTypes.Xbox)}>XBox</a></li>
         </ul>
         <input type="text" valueLink={this.linkState("displayName")}/>
         <input type="submit" value="Search" className="button" />
         <pre>{JSON.stringify(this.state, 2)}</pre>
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
