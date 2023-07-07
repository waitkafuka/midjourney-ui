import React from "react";
import { ConfigProvider } from "antd";
// import en from 'antd/locale/en_US';
import locale from 'antd/locale/zh_CN';
import { Provider } from "react-redux";
import store from '../store'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const withTheme = (node: JSX.Element) => (
  <>
    <Provider store={store}>
      <ConfigProvider
        locale={locale}
        theme={{
          token: {
            colorPrimary: '#393939',
            borderRadius: 8,
          },
        }}
      >
        {node}
      </ConfigProvider>
    </Provider>
  </>
)

export default withTheme;