import React from 'react';
import { Link, History } from 'react-router';
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
  displayName: 'UserDetail',
  mixins: [History],
  componentDidMount () {
    this.checkLogin();
  },
  checkLogin () {
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
    const username = this.props.user ? this.props.user.displayName : null;
    return (
        <div>
          <div className="title-bar">
            <span className="left title">
              <Link to="/">Infusion Solver</Link>
            </span>

            <span className="right">
              <span className="welcome-message">
                Hi, {username}!
              </span>
              <span>
                (<Link to="/logout">Logout</Link>)
              </span>
            </span>
          </div>
          <h1>Gear</h1>
          <ul>
            {this.props.gearsets.map(x => (<li key={x.owner}><Gearset {...x}/></li>))}
          </ul>
        </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
