import { message } from 'antd';
export const downloadFile = (url: string, filename: string = 'midjourney.png') => {
    message.info('正在下载图片...', 200);
    const regex = /\/([\w-]+\.(png|jpg|jpeg|gif|webp))/;
    const execResult = regex.exec(url);
    let fileName = execResult ? execResult[1] : 'midjourney.png';
    fileName = fileName.replace('waitkafuka_', '')
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.style.display = 'none';
    const cxt = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        cxt?.drawImage(img, 0, 0);
        const image = canvas.toDataURL("image/png")
        const dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = image;
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        document.body.removeChild(canvas);
        message.destroy();
    };
    img.src = url;
}

/**
 * 检测字符串是否包含中文
 * @param str 
 * @returns 
 */
export const hasChinese = function (str: string) {
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
}