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
            ? (<div className="grid-block skulls">
                {this.props.skulls.map(skull => <Skull { ...skull } key={skull.displayName}/>)}
               </div>)
            : ''
    );
    return (
        <div className="grid-content activity">
          <h2>{this.props.activityType}</h2>
          <p>{this.props.activityName}</p>
          {skulls}
        </div>
    );
  }
});

export default ActivityBlock;
