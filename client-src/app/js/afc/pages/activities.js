import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';

import { ActionCreators } from '../actions';
import Bucket from '../components/bucket';
import client from '../client';

function mapStateToProps (state) {
  return {
    activities: state.activities
  };
}

const Activities = React.createClass({
  displayName: 'Activities',
  propTypes: {
    activities: React.PropTypes.object
  },
  componentDidMount () {
    client.fetchActivities();
  },
  render () {
    return (
        <div>
          <h1>Activities</h1>
          <code><pre>{JSON.stringify(this.props.activities, null, 2)}</pre></code>
        </div>
    );
  }
});

export default connect(mapStateToProps)(Activities);
