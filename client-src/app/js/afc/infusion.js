'use strict';

const React = require('react');


/** little placeholder handler for pages that are still TODO */
class Todo extends React.Component {
  render() {
    return (<div>TODO</div>);
  }
}


module.exports = {
  pages: {
    UserDetail: Todo
  }
};
