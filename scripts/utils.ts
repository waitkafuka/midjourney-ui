import { message } from 'antd';

export const paintingTips = [
    '通过添加--ar可以设置图片宽高比例哦，例如：--ar 16:9',
    '即使因为网络问题生成失败了，您也可以在左侧“我的作品”中看到生成的图片呢',
]
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

/**
 * 从prompt中提取图片的宽高比
 */
export const getRatio = (prompt: string): { width: number, height: number } => {
    const regex = /--ar\s+(\d+):(\d+)/;
    const match = regex.exec(prompt);
    return {
        width: match ? parseInt(match[1]) : 1,
        height: match ? parseInt(match[2]) : 1
    }
}

/**
 * 根据图片的宽高比，和图片的宽度，计算出图片的高度
 * @param ratio
 * @param width
 */
export const getHeight = (ratio: { width: number, height: number }, baseWidth: number) => {
    return Math.floor(baseWidth / ratio.width * ratio.height);
}

/**
 * 随机获取一条绘画提示
 */
export const getRandomPaintingTip = () => {
    return paintingTips[Math.floor(Math.random() * paintingTips.length)];
}
