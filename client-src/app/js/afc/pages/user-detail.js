import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';
import Bucket from '../components/bucket';

function mapStateToProps (state) {
  return {
    gearsets: state.gearsets,
    user: state.user
  };
}

function mapDispatchToProps (dispatch) {
  return {
    gearFetched: (gearsets) => dispatch(ActionCreators.gearFetched(gearsets))
  };
}

const UserDetail = React.createClass({
  displayName: 'UserDetail',
  mixins: [History],
  propTypes: {
    gearFetched: React.PropTypes.func.isRequired,
    gearsets: React.PropTypes.array.isRequired,
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
      this.fetchGear();
    }
  },
  fetchGear () {
    request
        .get(`/bng/gear/${this.props.user.platform}/${this.props.user.membershipId}`)
        .end((err, resp) => {
          if (err) {
            console.error(err);
          }
          else {
            this.props.gearFetched(resp.body.gearsets);
          }
        });
  },
  getBuckets () {
    if (!this.props.gearsets.length) {
      return [];
    }

    const bucketNames = [
      'helmet',
      'chest',
      'arms',
      'boots',
      'classItem',
      'artifact',
      'primaryWeapon',
      'specialWeapon',
      'heavyWeapon',
      'ghost'];

    return bucketNames
        .map(name => ({
          name: name,
          items: Array.prototype.concat.apply([], this.props.gearsets.map(x => x[name]))
        }));
  },

  render () {
    const buckets = this.getBuckets();
    const username = this.props.user ? this.props.user.displayName : null;
    console.log(buckets);
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
          {buckets.length ? '' : 'loading...'}
          {buckets.map(x => (<Bucket {...x} key={x.name}/>))}
        </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
