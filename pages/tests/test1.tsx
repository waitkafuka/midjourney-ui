import Link from 'next/link';
import router from 'next/router';
import { useEffect, useState } from 'react';
function replaceLastElement(arr: number[], newElement: number) {
    // 返回更新后的数组
}
import DynamicImg from '../../components/DynamicImg';
let index = 0;
function Counter() {
    const [list, setList] = useState<{ src: string }[]>([]);
    const [src, setSrc] = useState<string>('');
    const srcs = ['https://oss-cdn.superx.chat/attachments/1100632439031877675/1112222441457070090/waitkafuka_Light_beige_suit__white_shirt__light_blue_tie__red_b_daeb41d7-21f7-4a7b-8925-601d0b76557f.png?x-oss-process=style/scale_500',
        'https://oss-cdn.superx.chat/attachments/1100632439031877675/1112218577118974044/waitkafuka_Dark_green_suit__white_shirt__white_wave_dot_element_920cea08-d354-4c45-8cea-2448489f2a96.png?x-oss-process=style/scale_500',
        'https://oss-cdn.superx.chat/attachments/1100632439031877675/1112211345409069066/waitkafuka_fashion_water_package_3d753dca-4027-4db2-a5db-61ab6cf7c15a.png?x-oss-process=style/scale_500']


    //随机设置一张图片地址
    const randowm = () => {
        //从 0-2 按顺序切换
        index++;
        console.log('index1', index);
        console.log('index', index % 3);

        // setSrc(srcs[index % 3])
        const l = list;
        let ele = {
            src: srcs[index % 3]
        };
        setInterval(() => {
            setList([...l, ele])
        }, 1000);
    }

    useEffect(() => {
        randowm();
    }, [])

    return (

        <div>
            {list.map((item, index) => {
                return <DynamicImg key={item.src} src={item.src}></DynamicImg>
            })}

            < button onClick={randowm}>切换图片</button>
            {src}
        </div >
    );
}

export default Counter;