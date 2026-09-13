import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        authUser:null,
        otherUsers:null,
        selectedUser:null,
        onlineUsers:null,
    },
    reducers:{
        setAuthUser:(state,action)=>{
            if (!action.payload) {
                state.authUser = null;
                return;
            }
            const { password, token, refreshToken, ...safeUser } = action.payload;
            state.authUser = safeUser;
        },
        setOtherUsers:(state, action)=>{
            state.otherUsers = action.payload;
        },
        setSelectedUser:(state,action)=>{
            state.selectedUser = action.payload;
        },
        setOnlineUsers:(state,action)=>{
            state.onlineUsers = action.payload;
        },
        removeOtherUser:(state, action)=>{
            const deletedUserId = action.payload;
            if(state.otherUsers){
                state.otherUsers = state.otherUsers.filter(u => u._id !== deletedUserId);
            }
            if(state.selectedUser?._id === deletedUserId){
                state.selectedUser = null;
            }
        }
    }
});
export const {setAuthUser,setOtherUsers,setSelectedUser,setOnlineUsers,removeOtherUser} = userSlice.actions;
export default userSlice.reducer;