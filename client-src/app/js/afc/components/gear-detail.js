import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import client from '../client';
import { ActionCreators } from '../actions';
import GearIcon from '../components/gear-icon';
import { report, infuse } from '../infuse';

function mapStateToProps (state) {
  return {
    gear: state.gear,
    solutions: state.solutions,
    user: state.user
  };
}

function mapDispatchToProps (dispatch) {
  return {
    solutionsFetched: (solutions) => dispatch(ActionCreators.solutionsFetched(solutions))
  };
}

const GearDetail = React.createClass({
  displayName: 'GearDetail',
  propTypes: {
    gear: React.PropTypes.object.isRequired,
    params: React.PropTypes.object,
    solutions: React.PropTypes.array.isRequired
  },
  render () {
    const item = this.props.gear[this.props.params.itemId];
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

export default connect(mapStateToProps, mapDispatchToProps)(GearDetail);
