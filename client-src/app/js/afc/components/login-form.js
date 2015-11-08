import classNames from 'classnames';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

const PSN = "psn";
const Xbox = "xbox";

const Platforms = {
  PSN,
  Xbox
};

const LoginForm = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps () {
    return {
      doLogin: function(username, password, platform) {}
    };
  },
  getInitialState () {
    return {
      username: "",
      password: "",
      platform: Platforms.PSN
    }
  },
  changePlatform (platform) {
    const form = this;
    return function() {
      form.setState({platform: platform});
    };
  },
  onSubmit (event) {
    event.preventDefault();
    const { username, password, platform } = this.state;
    this.props.doLogin(username, password, platform);
  },
  render () {
    return (
        <div>
          <h2>Load your gear.</h2>
          <form onSubmit={this.onSubmit} className="inline-label">
            <ul className="button-group secondary segmented">
              <li className={classNames({"is-active": this.state.platform === Platforms.PSN})}>
                <a href="#"
                   onClick={this.changePlatform(Platforms.PSN)}>PSN</a></li>
              <li className={classNames({"is-active": this.state.platform === Platforms.Xbox})}>
                <a href="#"
                   className={classNames({"is-active": this.state.platform === Platforms.Xbox})}
                   onClick={this.changePlatform(Platforms.Xbox)}>XBox</a></li>
            </ul>
            <input type="text" valueLink={this.linkState("username")} placeholder="username"/>
            <input type="password" valueLink={this.linkState("password")} placeholder="password"/>
            <input type="submit" value="Login" className="button" />
          </form>
        </div>
    );
  }
});

export default LoginForm;
