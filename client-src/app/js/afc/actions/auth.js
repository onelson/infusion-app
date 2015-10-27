const alt = require('../alt');
const AuthSource = require('../sources/auth');


class AuthActions {
  updateIdentity(player) {
    this.dispatch(player);
  }

  identityFailed(reason) {
    this.dispatch(reason);
  }

  fetchIdentity() {

    this.dispatch();

    AuthSource.fetch()
        .then((player) => {
          this.actions.updateIdentity(player);
        })
        .catch((errorMessage) => {
          this.actions.identityFailed(errorMessage);
        });
  }
}


module.exports = alt.createActions(AuthActions);
