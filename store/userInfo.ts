import { createSlice, configureStore } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    info: {},
    avatar: '',
    nickname_bg_color: 'rgb(70, 108, 212)',
    isShowUserProfileEditDialog: false,
  },
  reducers: {
    setUserInfo: (state, action) => {
      // Redux Toolkit 允许在 reducers 中编写 "mutating" 逻辑。
      // 它实际上并没有改变 state，因为使用的是 Immer 库，检测到“草稿 state”的变化并产生一个全新的
      // 基于这些更改的不可变的 state。
      let userInfo = action.payload;
      state.info = userInfo;
      if (userInfo.avatar) {
        state.avatar = userInfo.avatar;
      }
      if (userInfo.nickname_bg_color) {
        state.nickname_bg_color = userInfo.nickname_bg_color;
      }
    },
    setIsShowUserProfileEditDialog: (state, action) => {
      state.isShowUserProfileEditDialog = action.payload;
    },
    setNicknameBgColor: (state, action) => {
      state.nickname_bg_color = action.payload;
    },
    showUserProfileEditDialog: (state) => {
      state.isShowUserProfileEditDialog = true;
    },
    hideUserProfileEditDialog: (state) => {
      state.isShowUserProfileEditDialog = false;
    }

  },
});

export const { setUserInfo, showUserProfileEditDialog, hideUserProfileEditDialog } = userSlice.actions;

export default userSlice.reducer;