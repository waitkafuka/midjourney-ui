import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';
export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang='en'>
        <Head >
          <link
            rel="icon"
            href="/art/logo.png"
          />
          <link rel="stylesheet" href="//at.alicdn.com/t/c/font_4080772_96k6bph70c.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script async src="/art/baidutongji.js"></script>
        </body>
      </Html>
    );
  }
}
