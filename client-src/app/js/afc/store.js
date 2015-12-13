import { createHistory } from 'history';

import { createStore, combineReducers, compose } from 'redux';
import { routerStateReducer, reduxReactRouter } from 'redux-router';

import initialState from './initial-state';
import * as afcReducers from './reducers';
import routes from './routes';

const reducer = combineReducers(
    Object.assign(
      {},
      afcReducers,
      { router: routerStateReducer }
    ));

const store = compose(
    reduxReactRouter({
      routes,
      createHistory
    })
)(createStore)(reducer, initialState);

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
);

export default store;
