import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';

import { ActionCreators } from '../actions';
import client from '../client';

function mapStateToProps (state) {
  return {
    gear: state.gear,
    user: state.user
  };
}

function mapDispatchToProps (dispatch) {
  return {
    gearFetched: (gear) => dispatch(ActionCreators.gearFetched(gear))
  };
}

const Gear = React.createClass({
  displayName: 'Gear',
  mixins: [History],
  propTypes: {
    children: React.PropTypes.object,
    gearFetched: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired
  },
  componentDidMount () {
    this.checkLogin();
  },
  checkLogin () {
    if (!this.props.user) {
      this.history.pushState(null, '/login');
    }
    else {
      client.fetchGear(this.props.user);
    }
  },
  render () {
    return (
      <div>
        <h1>Gear</h1>
        {this.props.children}
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Gear);
