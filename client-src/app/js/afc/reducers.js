import { ActionTypes } from './actions';

export const initialState = {
  user: null,
  gearsets: []
};

export function user (state = initialState.user, action) {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE:
      return null; // FIXME
    case ActionTypes.LOGOUT:
      return null;
    default:
      return state;
  }
}

export function gearsets (state = initialState.gearsets, action) {
  switch (action.type) {
    case ActionTypes.FETCH_GEAR:
      return []; // FIXME
    default:
      return state;
  }
}
