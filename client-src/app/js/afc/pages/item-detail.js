import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import client from '../client';
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
    params: React.PropTypes.object,
    solutions: React.PropTypes.array.isRequired,
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
      client.fetchGear(this.props.user);
    }
  },
  render () {
    const item = this.props.gear[this.props.params.itemId];
    if (item) {
      return (
          <div>
            <GearIcon item={item}/>
          </div>
      );
    }
    return (<div></div>);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);
