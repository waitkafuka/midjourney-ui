
import type { AppProps } from 'next/app';
import MainLayout from '../layouts/main'
import '../public/antd.min.css';
import '../styles/globals.scss'
import { Provider } from "react-redux";
import store from '../store'
import withTheme from '../theme';
import { notification } from 'antd';

export default function App({ Component, pageProps }: AppProps) {
  notification.config({
    placement: 'top',
    duration: 5,
    // rtl: true,
  })
  return (<Provider store={store}>
    {withTheme(
      MainLayout(<Component {...pageProps} />)
    )}
  </Provider>
  )

}
