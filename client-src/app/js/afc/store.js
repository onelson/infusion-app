import { createStore, combineReducers } from 'redux';

import initialState from './initial-state';
import * as reducers from './reducers';

const store = createStore(
    combineReducers(reducers),
    initialState);

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
);

export default store;
