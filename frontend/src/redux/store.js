import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import postSlice from './postSlice.js';
import socketSlice from "./socketSlice.js"
import chatSlice from "./chatSlice.js";
import rtnSlice from "./rtnSlice.js";
import notificationReducer from "./notificationSlice";
import tripSlice from "./tripSlice.js";

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'


const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['socketio'] // Don't persist socket connection
}

const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    socketio: socketSlice,
    chat: chatSlice,
    realTimeNotification: rtnSlice,
    notification: notificationReducer,
    trip: tripSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'socketio/setSocket'],
                ignoredActionsPaths: ['payload'],
                ignoredPaths: ['socketio.socket'],
            },
        }),
});
export default store;