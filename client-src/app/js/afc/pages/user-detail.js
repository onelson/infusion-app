import React from 'react';
import { History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';
import Gearset from  '../components/gearset';

function mapStateToProps(state) {
  return {
    user: state.user,
    gearsets: state.gearsets
  };
}

function mapDispatchToProps(dispatch) {
  return {
    gearFetched: (gearsets) => dispatch(ActionCreators.gearFetched(gearsets))
  }
}

const UserDetail = React.createClass({
  mixins: [History],
  componentDidMount () {
    if (!this.props.user) {
      this.history.pushState(null, '/login');
    } else {
      this.fetchGear();
    }
  },
  fetchGear () {
    request
        .get(`/bng/gear/${this.props.user.platform}/${this.props.user.membershipId}`)
        .end((err, resp) => {
          this.props.gearFetched(resp.body.gearsets)
        });
  },
  render () {
    return (
        <div>
          <h1>Gear</h1>
          <ul>
            {this.props.gearsets.map(x => (<li key={x.owner}><Gearset {...x}/></li>))}
          </ul>
        </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
