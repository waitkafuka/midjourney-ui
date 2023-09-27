import { message } from 'antd';

export const paintingTips = [
    '通过添加--ar可以设置图片宽高比例哦，例如：--ar 16:9',
    '即使因为网络问题生成失败了，您也可以在左侧“我的作品”中看到生成的图片呢',
]

//创建a标签，模拟window.open
export const openWindow = (url: string) => {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    //随机一个 5 位的英文字母
    const id = Math.random().toString(36).slice(-5);
    a.setAttribute('id', id);
    a.click();
}


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
 * 从字符串中提取出clientId
 * @param str 
 * @returns 
 */
export const extractIdFromString = function (str: string) {
    const regex = /id-(\d+)/;  // 正则表达式匹配 id- 后面的数字
    const match = str.match(regex);  // 使用 match 方法匹配字符串

    if (match && match[1]) {
        return Number(match[1]);  // 返回匹配到的数字
    } else {
        return null;  // 如果没有找到匹配的数字，返回 null
    }
}

const inputString = 'lingyun5100@126.com,lingyun5100, id-17, http://8.218.209.122:8004';
const extractedId = extractIdFromString(inputString);
console.log(extractedId);  // 输出：17

//封装一个方法，自动跳转到放大页面，并携带图片链接参数
export const redirectToZoomPage = (url: string, openType = 'new_window') => {
    //新标签打开
    if (!url) return;
    //替换掉url中的?x-oss-process=style/scale_500
    url = url.replace(/\?x-oss-process=style\/scale_500/, '');
    const href = `/art/upscale?url=${encodeURIComponent(url)}`;
    if (openType === 'new_window') {
        openWindow(href);
    } else {
        window.location.href = href;
    }

}


/**
 * 判断mj prompt参数是否合法
 */
export const isPromptValid = (prompt: string): { isValid: boolean, message?: string } => {
    function validateArgs() {
        const invalidPattern = / -\w+/g;
        const hasInvalid = invalidPattern.test(prompt);
        if (hasInvalid) {
            return {
                isValid: false,
                message: '参数不合法，参数前面必须是：--，不能是：-',
            };
        }
        return {
            isValid: true,
        }
    }
    function checkAr() {
        if (prompt.indexOf('--ar') === -1) return { isValid: true, message: "" };
        const regex = /--ar\s+(\d+):(\d+(?=\s|$))/;
        const match = regex.exec(prompt);
        if (match) {
            const width = parseInt(match[1]);
            const height = parseInt(match[2]);
            if (width > 0 && height > 0) {
                return {
                    isValid: true,
                };
            }
        }
        return {
            isValid: false,
            message: 'ar 参数不合法，正确写法是：--ar m:n。例如：--ar 16:9，数字后需要有空格，不能有其他字符。'
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
            };
        }
        return {
            isValid: false,
            message: '除了垫图之外提示词不能为空哦',
        };
    }

    if (!validateArgs().isValid) return validateArgs();
    if (!checkAr().isValid) return checkAr();
    if (!checkLink().isValid) return checkLink();
    return {
        isValid: true,
    };
}

/**
 * 从链接中获取指定参数
 */
export const getQueryString = (name: string) => {
    const regex = new RegExp(`${name}=([^&]*)`);
    const match = regex.exec(window.location.search);
    return match ? match[1] : '';
}

/**
 * 从字符串中获取指定参数
 * @param name
 */
export const getQueryFromString = (string: string, name: string,) => {
    const regex = new RegExp(`${name}=([^&]*)`);
    const match = regex.exec(string);
    return match ? match[1] : '';
}

/**
 * 使用洗牌算法打乱数组
 * @param array 
 * @returns 
 */
export const shuffleArray = (array: any) => {
    const newArray = [...array]; // 复制原始数组，避免修改原数组
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 生成随机索引
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 交换元素
    }
    return newArray;
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
    const regex = / --(aspect|ar)\s+(\d+):(\d+)/;
    const match = regex.exec(prompt);
    return {
        width: match ? parseInt(match[2]) : 1,
        height: match ? parseInt(match[3]) : 1
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
