import { ActionTypes } from './actions';
import initialState from './initial-state';

export function activities (state = initialState.activities, action) {
  switch (action.type) {
    case ActionTypes.ACTIVITIES_FETCHED:
      return action.activities;
    default:
      return state;
  }
}

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

export function gear (state = initialState.gear, action) {
  switch (action.type) {
    case ActionTypes.GEAR_FETCHED:
      return action.gear;
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
