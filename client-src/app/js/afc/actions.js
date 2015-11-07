import keyMirror from 'keymirror';

export const ActionTypes = keyMirror({
  AUTHENTICATE: null,
  LOGOUT: null,
  FETCH_GEAR: null
});

export const Actions = {
  authenticate (username, password) {
    return {
      type: ActionTypes.AUTHENTICATE,
      username,
      password
    };
  },
  logout () {
    return { type: ActionTypes.LOGOUT };
  },
  fetchGear () {
    return { type: ActionTypes.FETCH_GEAR };
  }
};
