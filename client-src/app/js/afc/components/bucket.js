import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router';
import GearIcon from './gear-icon';

const Bucket = React.createClass({
  displayName: 'Bucket',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired
  },
  getDefaultProps () {
    return {
      name: '',
      items: []
    };
  },
  render () {
    return (<div className="bucket">
      <h2>{this.props.name}</h2>
      <ul>{this.props.items.map(
          item => (
          <li key={item.summary.itemId}
              className={classNames('tile', { completed: item.summary.isGridComplete })}>
            <Link to={`/gear/item/${item.summary.itemId}`}>
              <GearIcon item={item}/>
            </Link>
          </li>
          ))
      }</ul>
    </div>
    );
  }
});

export default Bucket;
