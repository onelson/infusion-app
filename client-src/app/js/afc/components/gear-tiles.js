import React from 'react';

const GearTiles = React.createClass({
  getDefaultProps () {
    return {
      items: [],
      iconPrefix: "https://www.bungie.net"
    };
  },
  render () {
    return (
        <ul>
          { this.props.items.map(i => (
              <li key={i.summary.itemId}>
                <img title={i.itemName} src={`${this.props.iconPrefix}${i.icon}`}/>
              </li>)) }
        </ul>
    );
  }
});

export default GearTiles;
