import React from 'react';
import { History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';

function mapStateToProps(state) {
  return {
    loginFailure: state.loginFailure,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loggedIn: (user) => dispatch(ActionCreators.loggedIn(user)),
    loginFailed: (reason) => dispatch(ActionCreators.loginFailed(reason))
  }
}

const Login = React.createClass({
  mixins: [History],
  authenticate (username, password, platform) {
    request
        .post('/bng/auth/login')
        .send({username, password, platform})
        .end((err, resp) => {
          if (err) {
            this.props.loginFailed(`Login Failed: ${resp.text}`);
          } else {
            this.props.loggedIn({
              membershipId: resp.body.membershipId,
              displayName: resp.body.displayName,
              platform
            });
            this.history.pushState(null, "/");
          }
        });
  },
  render () {
    return (
        <div>
          <LoginForm doLogin={this.authenticate}/>
          {this.props.loginFailure ? (<p>Aww snap! {this.props.loginFailure}</p>) : ''}
        </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);