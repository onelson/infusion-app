import keyMirror from 'keymirror';

export const ActionTypes = keyMirror({
  LOGGED_IN: null,
  LOGIN_FAILED: null,
  LOGOUT: null,
  GEAR_FETCHED: null,
  SOLUTIONS_FETCHED: null
});

export const ActionCreators = {
  loggedIn: (user) => ({ type: ActionTypes.LOGGED_IN, user }),
  loginFailed: (reason) => ({ type: ActionTypes.LOGIN_FAILED, reason }),
  logout: () => ({ type: ActionTypes.LOGOUT }),
  gearFetched: (gearsets) => ({ type: ActionTypes.GEAR_FETCHED, gearsets }),
  solutionsFetched: (solutions) => ({ type: ActionTypes.GEAR_FETCHED, solutions })
};
