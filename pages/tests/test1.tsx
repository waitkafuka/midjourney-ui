import { useEffect, useState } from 'react';
// 返回更新后的数组
let index = 0;
function test() {
    const [list, setList] = useState<{ src: string }[]>([]);
    const [src, setSrc] = useState<string>('');
    const srcs = ['https://o-c-h.arkit.com.cn/attachments/1100632439031877675/1112222441457070090/waitkafuka_Light_beige_suit__white_shirt__light_blue_tie__red_b_daeb41d7-21f7-4a7b-8925-601d0b76557f.png?x-oss-process=style/scale_500',
        'https://o-c-h.arkit.com.cn/attachments/1100632439031877675/1112218577118974044/waitkafuka_Dark_green_suit__white_shirt__white_wave_dot_element_920cea08-d354-4c45-8cea-2448489f2a96.png?x-oss-process=style/scale_500',
        'https://o-c-h.arkit.com.cn/attachments/1100632439031877675/1112211345409069066/waitkafuka_fashion_water_package_3d753dca-4027-4db2-a5db-61ab6cf7c15a.png?x-oss-process=style/scale_500']


    //随机设置一张图片地址
    const randomSrc1 = () => {
        //从 0-2 按顺序切换
        index++;
        setSrc(srcs[index % 3])
    }
    //用数组随机设置一张图片地址
    const randomSrc2 = () => {
        //从 0-2 按顺序切换
        index++;
        setList([{ src: srcs[index % 3] }])
    }

    useEffect(() => {
    }, [])

    return (

        <div>
            <img src={src}></img>
            {list.map((item, index) => {
                return <img key={1} data-d={index} src={item.src}></img>
            })}

            < button onClick={randomSrc1}>切换图片1</button>
            < button onClick={randomSrc2}>切换图片2</button>
            {src}
        </div >
    );
}

export default test;