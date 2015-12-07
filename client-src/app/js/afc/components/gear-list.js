import React from 'react';
import { connect } from 'react-redux';

import Bucket from '../components/bucket';

function mapStateToProps (state) {
  return {
    gear: state.gear
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

const GearList = React.createClass({
  displayName: 'GearList',
  propTypes: {
    gear: React.PropTypes.object.isRequired
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

    return (
      <div>
        {buckets.length ? '' : 'loading...'}
        {buckets.map(x => (<Bucket {...x} key={x.name}/>))}
      </div>);
  }
});

export default connect(mapStateToProps)(GearList);
