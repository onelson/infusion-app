import React from 'react';

import { ICON_PREFIX } from '../../settings';

export default React.createClass({
  displayName: 'GearIcon',
  propTypes: {
    item: React.PropTypes.object.isRequired
  },
  render () {
    const { item } = this.props;

    return (
        <img title={item.itemName} src={`${ICON_PREFIX}${item.icon}`}/>
    );
  }
});
