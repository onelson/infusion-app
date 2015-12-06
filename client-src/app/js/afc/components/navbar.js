import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

function mapStateToProps (state) {
  return {
    user: state.user
  };
}

const NavBar = React.createClass({
  displayName: 'NavBar',
  propTypes: {
    user: React.PropTypes.object
  },
  getUserLinks () {
    return this.props.user ? (
      <span>
        <span className="welcome-message">
          Hi, {this.props.user.displayName}!
        </span>
        {' '}
        <span>(<Link to="/logout">Logout</Link>)</span>
      </span>
    ) : (
      <Link to="/login">Login</Link>
    );
  },
  render () {
    return (
      <div className="title-bar">
        <span className="title left">
          AFC
        </span>
        <ul className="links center">
          <li><Link to="/">Activities</Link></li>
          <li><Link to="/gear">Gear</Link></li>
        </ul>
        <span className="right">
          {this.getUserLinks()}
        </span>
      </div>
    );
  }
});

export default connect(mapStateToProps)(NavBar);
