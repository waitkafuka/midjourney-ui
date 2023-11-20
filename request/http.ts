
declare const window: Window & { browserFinger: string }

//请求服务器
export const request = async function ({ path, data, method = "POST", headers = {}, stream = false, onDataChange }: { path: string, data?: any, method?: string, headers?: any, stream?: boolean, onDataChange?: Function }) {
    const options: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...headers,
            'x-bf': window.browserFinger
        },
        method,
        credentials: 'include',
        body: JSON.stringify(data)
    };

    if (method === 'GET') {
        delete options.body;
    }
    let response = await fetch(path, options);
    if (stream) {
        if (!response.body) return;
        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        // 将获取的数据转换回字符串
                        const string = new TextDecoder("utf-8").decode(value);

                        const arr = string.split(/(?<=\})(?=\{)/g);
                        for (let item of arr) {
                            try {
                                const data = JSON.parse(item);
                                if (data.code === 40015) return;
                                console.log(new Date(), '---', data); // 在此处你可以看到进度和图片URL
                                onDataChange && onDataChange(data);
                            } catch (error) {
                                console.log("json解析报错", error, "--", item, "--");
                            }
                        }
                        controller.enqueue(value);
                        push();
                    });
                };
                push();
            }
        });
    } else {
        //如果接口返回状态码正常，则直接返回数据,否则抛出异常
        if (response.status === 200) {
            return await response.json();
        } else if (response.status === 504) {
            throw new Error('Request Timeout, 接口请求超时，请稍后再试')
        } else {
            //如果接口返回状态码不正常，则抛出异常，把错误信息返回
            let j = null;
            try {
                j = await response.json();
            } catch (error) {
                throw new Error(response.statusText)
            }
            throw new Error(j ? JSON.stringify(j) : response.statusText);
        }
    }
}

//请求国内服务器
export const requestAliyun = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request({ path: `/api/${path}`, data, method, headers });
}

//请求国内服务器
export const requestAliyunArt = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request({ path: `/art/api/${path}`, data, method, headers });
}

//请求国内服务器 stream
export const requestAliyunArtStream = async function ({
    path, data, method = "POST", headers, onDataChange
}: { path: string, data?: any, method?: string, headers?: any, onDataChange: Function }) {
    return request({ path: `/art/api/${path}`, data, method, headers, stream: true, onDataChange });
}

