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
  getInitialState () {
    return { fetching: false, solutions: [] };
  },
  componentDidMount () {
    this.generateSolutions();
  },
  componentDidUpdate (prevProps) {
    if (prevProps.itemId !== this.props.itemId) {
      this.generateSolutions();
    }
  },
  getItem () {
    return this.props.gear[this.props.itemId];
  },
  generateSolutions () {
    const item = this.getItem();

    if (!item || this.state.fetching) {
      return;
    }

    this.setState({ fetching: true });

    const bucket = Object.keys(this.props.gear)
        .map(x => this.props.gear[x])
        .filter(x => x.bucketTypeHash === item.bucketTypeHash && x !== item);

    report(item, bucket).end((err, resp) => {
      this.setState({ fetching: false });

      if (err) {
        console.error(err);
        return;
      }

      const result = resp.body;
      const solutions = [];

      if (result.bestValue) {
        solutions.push(result.bestValue);
      }

      if (result.bestCost) {
        solutions.push(result.bestCost);
      }

      this.setState({ solutions });
    });

  },
  render () {
    const item = this.getItem();
    if (!item) {
      return (<div></div>);
    }

    const { solutions } = this.state;

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
});

export default connect(mapStateToProps)(GearDetail);
