import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';

import { ActionCreators } from '../actions';
import Bucket from '../components/bucket';
import client from '../client';
import ActivityBlocks from '../components/activity-blocks';

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
    console.debug('mount');
    client.fetchActivities();
  },
  render () {
    return (
      <div>
        <h1>Activities</h1>
        <ActivityBlocks activities={this.props.activities}/>
      </div>
    );
  }
});

export default connect(mapStateToProps)(Activities);
