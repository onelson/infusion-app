import React from 'react';
import { History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';

function mapDispatchToProps (dispatch) {
  return {
    logout: () => dispatch(ActionCreators.logout())
  };
}

const Logout = React.createClass({
  displayName: 'Logout',
  mixins: [History],
  propTypes: {
    logout: React.PropTypes.func.isRequired
  },
  componentDidMount () {
    this.doLogout();
  },
  componentDidUpdate () {
    this.doLogout();
  },
  doLogout () {
    this.props.logout();
    this.history.pushState(null, '/login');
  },
  render: () => (<div>Cya!</div>)
});

export default connect(null, mapDispatchToProps)(Logout);
