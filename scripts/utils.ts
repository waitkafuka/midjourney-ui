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
 * 判断mj prompt是否合法
 */
export const isPromptValid = (prompt: string): { isValid: boolean, message: string } => {
    function validateText() {
        const invalidPattern = / -\w+/g;
        const hasInvalid = invalidPattern.test(prompt);
        if (hasInvalid) {
            return {
                isValid: false,
                message: '参数不合法，参数前面必须是：--，不能是： -',
            };
        }
        return {
            isValid: true,
            message: ""
        }
    }
    function checkAr() {
        if (prompt.indexOf('--ar') === -1) return { isValid: true, message: "" };
        const regex = /--ar\s+(\d+):(\d+)/;
        const match = regex.exec(prompt);
        if (match) {
            const width = parseInt(match[1]);
            const height = parseInt(match[2]);
            if (width > 0 && height > 0) {
                return {
                    isValid: true,
                    message: ''
                };
            }
        }
        return {
            isValid: false,
            message: 'ar 参数不合法，正确写法是：--ar m:n。例如：--ar 16:9'
        };
    }
    //检查除了链接之外是否为空
    function checkLink() {
        //去除掉<>包裹的内容
        const regex = /<[^>]*>/g;
        const match = prompt.replace(regex, '');
        if (match.trim().length > 0) {
            return {
                isValid: true,
                message: ""
            };
        }
        return {
            isValid: false,
            message: '除了垫图之外提示词不能为空哦',
        };
    }

    if (!validateText().isValid) return validateText();
    if (!checkAr().isValid) return checkAr();
    if (!checkLink().isValid) return checkLink();
    return {
        isValid: true,
        message: ''
    };
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
