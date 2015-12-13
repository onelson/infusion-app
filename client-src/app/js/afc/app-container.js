import React from 'react';

import { NavBar } from './components';

const AppContainer = React.createClass({
  displayName: 'AppContainer',
  propTypes: {
    children: React.PropTypes.object.isRequired
  },
  render () {
    return (
      <div>
        <NavBar/>
        <div className="grid-container">
          {this.props.children}
        </div>
      </div>
    );
  }
});

export default AppContainer;
