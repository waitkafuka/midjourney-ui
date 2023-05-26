import Link from 'next/link';
import router from 'next/router';
import { useEffect, useState } from 'react';

import { CacheablePage } from '../components/cacheAblePage';
import { useKeepAlive } from 'next-easy-keepalive';
function Counter() {
    const { useMemState, useNotBackEffect, useBackActive } = useKeepAlive('Counter');
    const [list, setList] = useMemState<number[]>([], 'list');

    function handleClick() {
        console.log(list);
        setList(v => [...v, Math.random()]);
    }

    useNotBackEffect(() => {
        console.log('history pop')
    }, []);

    /**
     * The useBackActive hook is only executed on first render when going back.
     * Like the useEffect hook, the second takes an array of dependencies.
     * The hook runs again when the value changes.
     */
    useBackActive(() => {
        console.log('history push')
    }, []);

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