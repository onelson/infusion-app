import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';

import { ActionCreators } from '../actions';
import Bucket from '../components/bucket';
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

// bucket hash -> name
const bucketTypes = {
  3448274439: 'Helmet',
  14239492: 'Chest',
  3551918588: 'Gloves',
  20886954: 'Boots',
  1585787867: 'Class Item',
  434908299: 'Artifact',
  1498876634: 'Primary Weapon',
  2465295065: 'Special Weapon',
  953998645: 'Heavy Weapon',
  4023194814: 'Ghost'
};

const UserDetail = React.createClass({
  displayName: 'UserDetail',
  mixins: [History],
  propTypes: {
    gear: React.PropTypes.object.isRequired,
    gearFetched: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired
  },
  componentDidMount () {
    this.checkLogin();
  },
  componentWillReceiveProps () {
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
  getBuckets () {
    const byBucket = {
      3448274439: [],
      14239492: [],
      3551918588: [],
      20886954: [],
      1585787867: [],
      434908299: [],
      1498876634: [],
      2465295065: [],
      953998645: [],
      4023194814: []
    };

    Object.keys(this.props.gear).map(key => this.props.gear[key]).forEach(item => {
      byBucket[item.bucketTypeHash].push(item);
    });

    return Object.keys(byBucket)
        .map(bucketHash => ({
          name: bucketTypes[bucketHash],
          items: byBucket[bucketHash]
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
