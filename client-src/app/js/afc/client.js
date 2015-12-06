import request from 'superagent';
import store from './store';
import { ActionCreators } from './actions';

export default {
  fetchActivities () {
    // activities don't change but once a day so if we have some, don't bother
    if (!store.getState().activities) {
      request
          .get('/bng/activities')
          .accept('application/json')
          .end((err, resp) => {
            if (err) {
              console.error(err);
            }
            else {
              store.dispatch(ActionCreators.activitiesFetched(resp.body));
            }
          });
    }
  },
  fetchGear (user) {
    request
        .get(`/bng/gear/${user.platform}/${user.membershipId}`)
        .accept('application/json')
        .end((err, resp) => {
          if (err) {
            console.error(err);
          }
          else {
            store.dispatch(ActionCreators.gearFetched(resp.body.gear));
          }
        });
  }
};
