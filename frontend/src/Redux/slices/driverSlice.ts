import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface DriverState {
    email: string;
}

const initialState: DriverState = {
    email: "",
};

const driverSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setEmailId: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        clearAuth: (state) => {
            state.email = "";
        },
    },
});

export const { setEmailId, clearAuth } = driverSlice.actions;
export default driverSlice.reducer;