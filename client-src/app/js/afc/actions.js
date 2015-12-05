import keyMirror from 'keymirror';

export const ActionTypes = keyMirror({
  ACTIVITIES_FETCHED: null,
  LOGGED_IN: null,
  LOGIN_FAILED: null,
  LOGOUT: null,
  GEAR_FETCHED: null,
  SOLUTIONS_FETCHED: null
});

export const ActionCreators = {
  activitiesFetched: (activities) => ({ type: ActionTypes.ACTIVITIES_FETCHED, activities }),
  loggedIn: (user) => ({ type: ActionTypes.LOGGED_IN, user }),
  loginFailed: (reason) => ({ type: ActionTypes.LOGIN_FAILED, reason }),
  logout: () => ({ type: ActionTypes.LOGOUT }),
  gearFetched: (gear) => ({ type: ActionTypes.GEAR_FETCHED, gear }),
  solutionsFetched: (solutions) => ({ type: ActionTypes.GEAR_FETCHED, solutions })
};
