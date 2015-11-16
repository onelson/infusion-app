import React from 'react';

const ICON_PREFIX = 'https://www.bungie.net';

export default React.createClass({
  displayName: 'GearIcon',
  propTypes: {
    item: React.PropTypes.object.isRequired
  },
  render () {
    const { item } = this.props;
    return (<img title={item.itemName} src={`${ICON_PREFIX}${item.icon}`}/>);
  }
});
