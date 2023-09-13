/**
    * 判断是否是pc设备
    */
export const getDeviceType = function (): 'android' | 'ios' | 'pc' {
    const ua = navigator.userAgent;

    if (/android/i.test(ua)) {
        return "android";
    }

    if (/iPad|iPhone|iPod/i.test(ua)) {
        return "ios";
    }

    return "pc";
}

//判断是否是手机微信环境
export const isMobileWeChat = function () {
    var ua = navigator.userAgent.toLowerCase();
    // ua中包含micromessenger字符串，且包含iphone或者android字符串
    if (/micromessenger/i.test(ua) && (/iphone/i.test(ua) || /android/i.test(ua))) {
        return true;
    } else {
        return false;
    }
}

//判断是否是 PC 或者手机微信环境
export const isPCWeChatOrMobileWeChat = function () {
    var ua = navigator.userAgent.toLowerCase();
    // ua中包含micromessenger字符串，且包含iphone或者android字符串
    if (/micromessenger/i.test(ua)) {
        return true;
    } else {
        return false;
    }
}