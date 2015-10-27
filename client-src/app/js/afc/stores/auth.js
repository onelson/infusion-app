'use strict';

const alt = require('../alt');
const AuthActions = require('../actions/auth');


class AuthStore {
  constructor() {
    this.identity = null;
    this.errorMessage = null;

    this.bindListeners({
      handleUpdateIdentity: AuthActions.UPDATE_IDENTITY,
      handleFetchIdentity: AuthActions.FETCH_IDENTITY,
      handleIdentityFailed: AuthActions.IDENTITY_FAILED
    });
  }

  handleUpdateIdentity(player) {
    this.identity = player;
    this.errorMessage = null;

  }

  handleFetchIdentity() {
    this.identity = null;
  }

  handleIdentityFailed(reason) {
    this.errorMessage = reason;
  }

}

module.exports = alt.createStore(AuthStore, 'AuthStore');
