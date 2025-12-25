import { createSlice } from "@reduxjs/toolkit"

const initialState = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    displayName: "",
    username: "",
    email: "",
    profile_picture: ""
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            state._id = action.payload._id;
            state.displayName = action.payload.displayName;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.profile_picture = action.payload.profile_picture;
        },
        clearUserDetails: (state) => {
            state._id = "",
                state.displayName = "",
                state.username = "",
                state.email = ""
        },
    },
})

export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer