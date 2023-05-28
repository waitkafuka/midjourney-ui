import Link from 'next/link';
import { useEffect, useState } from 'react';


function Counter() {
    const [list, setList] = useState<number[]>([]);

    function handleClick() {
        console.log(list);
        setList(v => [...v, Math.random()]);
    }

    useEffect(() => {
        // setInterval(() => {
        //     handleClick()
        // },1000)
    }, []);


    return (
        <div>
            <p>You clicked {list} times</p>
            <button onClick={handleClick}>Click me</button>
            test2
            <Link href="/test1">切换路由</Link>
        </div>
    );
}

export default Counter;