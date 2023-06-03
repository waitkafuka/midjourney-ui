import { createSlice, configureStore } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    info: {
      point_count: 0,
    },
    //显示购买弹窗
    isShowBuyPointDialog: false,
    avatar: '',
    nickname_bg_color: 'rgb(70, 108, 212)',
    isShowUserProfileEditDialog: false,
    thumbUpList: [] as number[], // 点赞过的图片 ID 列表
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
    },
    setThumbUpList: (state, action) => {
      state.thumbUpList = action.payload;
    },
    setIsShowBuyPointDialog(state, action) {
      state.isShowBuyPointDialog = action.payload;
    },
    thumbUp: (state, action) => {
      state.thumbUpList.push(action.payload as number);
      state.thumbUpList = JSON.parse(JSON.stringify(state.thumbUpList));
    },
    cancelThumbUp: (state, action) => {
      let index = state.thumbUpList.indexOf(action.payload as number);
      if (index !== -1) {
        state.thumbUpList.splice(index, 1);
        state.thumbUpList = JSON.parse(JSON.stringify(state.thumbUpList));
      }
    },
    pointChange: (state, action) => {
      state.info.point_count = action.payload;
    }

  },
});

export const { setUserInfo, showUserProfileEditDialog, hideUserProfileEditDialog } = userSlice.actions;

export default userSlice.reducer;