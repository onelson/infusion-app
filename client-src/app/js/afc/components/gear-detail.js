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

      const result = report(item, bucket);
      const solutions = [];

      if (result !== null) {
        if (result.bestValue) {
          solutions.push(result.bestValue);
        }
        solutions.push(result.bestCost);
      }

      return (
          <div>
            <h3>{item.itemName}</h3>
            <GearIcon item={item}/>
            {solutions.length === 0
                ? (<p>No solutions available.</p>)
                : (<ul>{solutions.map(x => <li key={x.value}><pre>{JSON.stringify(x, null, 2)}</pre></li>)}</ul>)}

          </div>
      );
    }
    return (<div></div>);
  }
});

export default connect(mapStateToProps)(GearDetail);
