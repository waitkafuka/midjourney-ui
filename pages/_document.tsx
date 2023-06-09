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
          <title>AI绘画, Midjourney绘画, 人工智能绘画</title>
          <meta name="keywords" content="AI绘画, Midjourney绘画, 人工智能绘画, Dalle 绘画, Stable Diffusion" />
          <meta name="description" content="AI绘画, Midjourney绘画, 人工智能绘画, Stable Diffusion。使用人工智能+描述词画出你想要绘制的图像。" />
          <meta
            name="viewport"
            content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
          />
          <link rel="stylesheet" href="//at.alicdn.com/t/c/font_4080772_udf90wavud.css" />

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
