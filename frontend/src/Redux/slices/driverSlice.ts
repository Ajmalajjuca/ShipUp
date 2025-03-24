import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface DriverState {
    email: string;
    driverData: any | null;
    token: string | null;
}

const initialState: DriverState = {
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
        },
        setDriverData: (state, action: PayloadAction<{ driverData: any; token: string }>) => {
            state.driverData = action.payload.driverData;
            state.token = action.payload.token;
        },
        clearDriverData: (state) => {
            state.driverData = null;
            state.token = null;
            state.email = '';
        }
    },
});

export const { setEmailId, setDriverData, clearDriverData } = driverSlice.actions;
export default driverSlice.reducer;