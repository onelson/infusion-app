import React from 'react';
import Skull from './skull';

const ActivityBlock = React.createClass({
  displayName: 'ActivityBlock',
  propTypes: {
    activityName: React.PropTypes.string.isRequired,
    activityType: React.PropTypes.string.isRequired,
    skulls: React.PropTypes.array.isRequired
  },
  getDefaultProps () {
    return { skulls: [] };
  },
  render () {
    const skulls = (
        this.props.skulls.length
            ? this.props.skulls.map(skull => <Skull { ...skull } key={skull.displayName}/>)
            : ''
    );
    return (
        <div className="grid-content">
          <h2>{this.props.activityType}</h2>
          <p>{this.props.activityName}</p>
          <div className="grid-block">
            {skulls}
          </div>
        </div>
    );
  }
});

export default ActivityBlock;
