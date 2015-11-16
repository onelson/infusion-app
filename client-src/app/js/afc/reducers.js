import { ActionTypes } from './actions';

export const initialState = {
  loginFailure: null,
  user: localStorage.user ? JSON.parse(localStorage.user) : null,
  gearsets: [],
  solutions: []
};

export function loginFailure (state = initialState.loginFailure, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_FAILED:
      return action.reason;
    default:
      return state;
  }
}

export function user (state = initialState.user, action) {
  switch (action.type) {
    case ActionTypes.LOGGED_IN:
        localStorage.user = JSON.stringify(action.user);
      return action.user;
    case ActionTypes.LOGOUT:
        localStorage.clear();
      return null;
    default:
      return state;
  }
}

export function gearsets (state = initialState.gearsets, action) {
  switch (action.type) {
    case ActionTypes.GEAR_FETCHED:
      return action.gearsets;
    default:
      return state;
  }
}

export function solutions (state = initialState.solutions, action) {
  switch (action.type) {
    case ActionTypes.SOLUTIONS_FETCHED:
      return action.solutions;
    default:
      return state;
  }
}
