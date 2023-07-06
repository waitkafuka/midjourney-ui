// pages/post/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { requestAliyunArt } from '../../request/http';
import { ImgCardModel } from '../../scripts/types';
import PureImgCard from '../../components/masonry/PureImgCard'

export default function ImgDetail() {
    const [imgDetail, setImgDetail] = useState<ImgCardModel>();//图片详情
    const router = useRouter();
    const { id } = router.query; // 从路由中获取路径参数

    const queryImg = async () => {
        const { data } = await requestAliyunArt('get-img-detail', { id });
        console.log(data);
        setImgDetail(data);
    }

    const onImgThumbUpActionDone = (imgId: number, action: string) => {
        // if (imgDetail && imgDetail.id === imgId) {
        //     queryImg();
        // }
        const count = imgDetail?.thumb_up_count || 0;
        if (imgDetail) {
            imgDetail.thumb_up_count = action === 'add' ? count + 1 : count - 1;
            setImgDetail(imgDetail => imgDetail);
        }

    }
    useEffect(() => {
        queryImg();
    }, [id]);


    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "20px" }}>
            {
                imgDetail && <PureImgCard onImgThumbUpActionDone={onImgThumbUpActionDone} hasLikeButton={true} model={imgDetail} hasDelete={false} showThumbImg={true} isLoading={false} />
            }

        </div>
    );
}