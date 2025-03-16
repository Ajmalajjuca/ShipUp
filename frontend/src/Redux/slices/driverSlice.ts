import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DriverState {
    emailId: string | null;
    driverData: any | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: DriverState = {
    emailId: localStorage.getItem("driverEmail") || null,
    driverData: null,
    token: null,
    isAuthenticated: false
};

const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {
        setEmailId: (state, action: PayloadAction<string>) => {
            state.emailId = action.payload;
            localStorage.setItem("driverEmail", action.payload);
        },
        setDriverData: (state, action: PayloadAction<{ driverData: any; token: string }>) => {
            state.driverData = action.payload.driverData;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        clearDriverData: (state) => {
            state.emailId = null;
            state.driverData = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("driverEmail");
        }
    }
});

export const { setEmailId, setDriverData, clearDriverData } = driverSlice.actions;
export default driverSlice.reducer;