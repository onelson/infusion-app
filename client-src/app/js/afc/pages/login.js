import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import request from 'superagent';

import { ActionCreators } from '../actions';
import LoginForm from '../components/login-form';

function mapStateToProps (state) {
  return {
    loginFailure: state.loginFailure
  };
}

function mapDispatchToProps (dispatch) {
  return {
    loginFailed: (reason) => dispatch(ActionCreators.loginFailed(reason)),
    loggedIn: (user) => dispatch(ActionCreators.loggedIn(user))
  };
}

const Login = React.createClass({
  displayName: 'Login',
  mixins: [History],
  propTypes: {
    loggedIn: React.PropTypes.func.isRequired,
    loginFailed: React.PropTypes.func.isRequired,
    loginFailure: React.PropTypes.any
  },
  authenticate (username, password, platform) {
    request
        .post('/bng/auth/login')
        .send({ username, password, platform })
        .end((err, resp) => {
          if (err) {
            this.props.loginFailed(`Login Failed: ${resp.text}`);
          }
          else {
            this.props.loggedIn({
              membershipId: resp.body.membershipId,
              displayName: resp.body.displayName,
              platform
            });
            this.history.pushState(null, '/');
          }
        });
  },
  render () {
    return (
        <div>
          <div className="title-bar">
            <span className="left title">
              <Link to="/">Infusion Solver</Link>
            </span>
          </div>
          <LoginForm doLogin={this.authenticate}/>
          {this.props.loginFailure ? (<p>Aww snap! {this.props.loginFailure}</p>) : ''}
        </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
