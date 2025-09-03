import { createSlice } from '@reduxjs/toolkit';

const tripSlice = createSlice({
    name: 'trip',
    initialState: {
        trips: [],
        currentTrip: null,
        publicTrips: [],
        loading: false,
        error: null
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setTrips: (state, action) => {
            state.trips = action.payload;
        },
        addTrip: (state, action) => {
            state.trips.unshift(action.payload);
        },
        updateTrip: (state, action) => {
            const index = state.trips.findIndex(trip => trip._id === action.payload._id);
            if (index !== -1) {
                state.trips[index] = action.payload;
            }
            if (state.currentTrip && state.currentTrip._id === action.payload._id) {
                state.currentTrip = action.payload;
            }
        },
        removeTrip: (state, action) => {
            state.trips = state.trips.filter(trip => trip._id !== action.payload);
            if (state.currentTrip && state.currentTrip._id === action.payload) {
                state.currentTrip = null;
            }
        },
        setCurrentTrip: (state, action) => {
            state.currentTrip = action.payload;
        },
        setPublicTrips: (state, action) => {
            state.publicTrips = action.payload;
        },
        clearCurrentTrip: (state) => {
            state.currentTrip = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setLoading,
    setError,
    setTrips,
    addTrip,
    updateTrip,
    removeTrip,
    setCurrentTrip,
    setPublicTrips,
    clearCurrentTrip,
    clearError
} = tripSlice.actions;

export default tripSlice.reducer;
