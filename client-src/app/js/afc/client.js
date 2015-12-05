import request from 'superagent';
import store from './store';
import { ActionCreators } from './actions';

export default {
  fetchActivities () {
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
