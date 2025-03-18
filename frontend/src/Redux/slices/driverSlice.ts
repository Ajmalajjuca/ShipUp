import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface DriverState {
    email: string | null;
}

const initialState: DriverState = {
    email: localStorage.getItem("driverEmail") || null,
};

const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {
        setEmailId: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
            localStorage.setItem("driverEmail", action.payload);
        },
        clearAuth: (state) => {
            state.email = null;
            localStorage.removeItem("driverEmail");
        },
    },
});

export const { setEmailId, clearAuth } = driverSlice.actions;
export default driverSlice.reducer;