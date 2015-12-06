import React from 'react';
import { ICON_PREFIX } from '../../settings';

const Skull = React.createClass({
  displayName: 'Skull',
  propTypes: {
    description: React.PropTypes.string.isRequired,
    displayName: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired
  },
  render () {
    return (
        <div className="skull">
          <img src={ICON_PREFIX + this.props.icon}
               title={this.props.description}/>
          <p>{this.props.displayName}</p>
        </div>
    );
  }
});

export default Skull;
