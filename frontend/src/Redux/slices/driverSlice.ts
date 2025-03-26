import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface DriverState {
    email: string;
    driverData: any | null;
    token: string | null;
}

// Get persisted state from localStorage
const persistedState = localStorage.getItem('driverState');
const initialState: DriverState = persistedState ? 
    JSON.parse(persistedState) : 
    {
        email: '',
        driverData: null,
        token: null
    };

const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {
        setEmailId: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
            // Persist to localStorage
            localStorage.setItem('driverState', JSON.stringify(state));
        },
        setDriverData: (state, action: PayloadAction<{ driverData: any; token: string }>) => {
            state.driverData = action.payload.driverData;
            state.token = action.payload.token;
            // Persist to localStorage
            localStorage.setItem('driverState', JSON.stringify(state));
        },
        clearDriverData: (state) => {
            state.driverData = null;
            state.token = null;
            state.email = '';
            // Clear from localStorage
            localStorage.removeItem('driverState');
        }
    },
});

export const { setEmailId, setDriverData, clearDriverData } = driverSlice.actions;
export default driverSlice.reducer;