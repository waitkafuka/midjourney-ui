import React from "react";
import { ConfigProvider } from "antd";
import en from 'antd/locale/en_US';
import { Provider } from "react-redux";
import store from '../store'

const withTheme = (node: JSX.Element) => (
  <>
    <Provider store={store}>
      <ConfigProvider
        locale={en}
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