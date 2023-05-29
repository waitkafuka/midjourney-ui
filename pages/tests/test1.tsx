import Link from 'next/link';
import router from 'next/router';
import { useEffect, useState } from 'react';
function replaceLastElement(arr: number[], newElement: number) {
    // 返回更新后的数组
}
function Counter() {
    const [list, setList] = useState<number[]>([1, 2, 3]);
    function handleClick() {
        // setInterval(() => {
            // setList(arr => {
            //     // arr[arr.length - 1] = Math.random(); // 替换最后一个元素
            //     return [...arr, Math.random()];
            // });
            setList([...list, Math.random()]);
        // }, 1000);
    }

    /**
     * The useBackActive hook is only executed on first render when going back.
     * Like the useEffect hook, the second takes an array of dependencies.
     * The hook runs again when the value changes.
     */

    useEffect(() => {
        // setInterval(() => {
        //     handleClick()
        // },1000)
        console.log('test1 init');

    }, []);

    const handleLinkClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        router.push('/test2');
    };


    return (

        <div>
            <p>You clicked {list} times</p>
            <button onClick={handleClick}>Click me</button>
            test1
            {/* <Link href="/test2"> */}
            <a onClick={handleLinkClick}>Go to target route</a>
            {/* </Link> */}
        </div>
    );
}

export default Counter;