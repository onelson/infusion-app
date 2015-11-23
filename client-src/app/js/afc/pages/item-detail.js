import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';
import GearIcon from '../components/gear-icon';

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

const ItemDetail = React.createClass({
  displayName: 'ItemDetail',
  propTypes: {
    gear: React.PropTypes.object.isRequired,
    solutions: React.PropTypes.array.isRequired,
    user: React.PropTypes.object.isRequired
  },
  componentDidUpdate (nextProps, nextState) {
    console.debug('updating');
  },
  render () {
    const item = this.props.gear[this.props.params.itemId];
    return (
      <div>
        <GearIcon item={item}/>
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);
