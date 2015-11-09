import React from 'react';
import { History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(ActionCreators.logout())
  }
}

const Logout = React.createClass({
  displayName: 'Logout',
  mixins: [History],
  doLogout() {
    this.props.logout();
    this.history.pushState(null, '/login');
  },
  componentDidMount() {
    this.doLogout();
  },
  render: () => (<div>Cya!</div>)
});

export default connect(null, mapDispatchToProps)(Logout);
