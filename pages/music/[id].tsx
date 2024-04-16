import { useRouter } from 'next/router';
import { requestAliyunArt, requestAliyunArtStream } from "../../request/http";
import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import MusicCard from '../../components/MusicCard'

export default function MusicPage({ params }: any) {
    const router = useRouter();
    const { id } = router.query;
    //设置音乐详情
    const [musicDetail, setMusicDetail] = useState<any>({});
    //查询音乐详情
    async function fetchMusicDetail() {
        const res = await requestAliyunArt('suno-music-detail', { id });
        if (res.code === 0) {
            setMusicDetail(res.data);
        } else {
            message.error(res.message);
        }
        console.log(res);

    }

    useEffect(() => {
        fetchMusicDetail();
    }, [id]);
    return (
        <div className='share-music-card-box'>
            <MusicCard {...musicDetail}></MusicCard>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                <Button onClick={()=>{
                    router.push(`/suno`)
                }}>立即创作</Button>
            </div>
        </div>
    )
}

