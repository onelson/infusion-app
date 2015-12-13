import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import client from '../client';
import { ActionCreators } from '../actions';
import GearIcon from '../components/gear-icon';
import { report, infuse } from '../infuse';

function mapStateToProps (state) {
  const { itemId } = state.router.params;
  return {
    itemId,
    gear: state.gear,
    user: state.user
  };
}

const GearDetail = React.createClass({
  displayName: 'GearDetail',
  propTypes: {
    gear: React.PropTypes.object.isRequired,
    itemId: React.PropTypes.string.isRequired
  },
  render () {
    const item = this.props.gear[this.props.itemId];
    if (item) {
      const bucket = Object.keys(this.props.gear)
          .map(x => this.props.gear[x])
          .filter(x => x.bucketTypeHash === item.bucketTypeHash && x !== item);

      const data = report(item, bucket);
      const { bestCost, bestValue } = data;

      const solutions = (
          bestCost.value !== bestValue.value ? [bestValue, bestCost] : [bestCost]
      ).filter(x => x.steps.length);
      return (
          <div>
            <h3>{item.itemName}</h3>
            <GearIcon item={item}/>
            <ul>
              {solutions.map(x => <li key={x.value}><pre>{JSON.stringify(x, null, 2)}</pre></li>)}
            </ul>
          </div>
      );
    }
    return (<div></div>);
  }
});

export default connect(mapStateToProps)(GearDetail);
