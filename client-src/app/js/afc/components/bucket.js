
import React from 'react';

const Bucket = React.createClass({
  displayName: 'Bucket',
  getDefaultProps () {
    return {
      name: '',
      items: [],
      iconPrefix: "https://www.bungie.net"
    };
  },

  solveFor(item, others) {
    // FIXME: link to page instead???
  },

  render () {
    return (<div className="bucket">
      <h2>{this.props.name}</h2>
      <ul>{this.props.items.map(
          item => (
          <li key={item.summary.itemId} className="tile"
              onClick={this.solveFor(item, this.items.filter(x => x !== item))}>
            <img title={item.itemName} src={`${this.props.iconPrefix}${item.icon}`}/>
          </li>
          ))
      }</ul>
    </div>
    );
  }
});

export default Bucket;
