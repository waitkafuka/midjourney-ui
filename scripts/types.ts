export interface ImgCardModel {
    id: number,
    img_url: string | null,
    img_id?:string,
    prompt: string,
    create_time: Date,
    is_public: number,
    thumb_up_count: number,
    painting_type: PaintingType,
    img_base_path?: string,
    width?: number,
    height?: number,
    paint_params?: string,
    like_count?: number,
}


export interface MusicModel {
    id?: number;
    imgUrl: string;
    imgLargeUrl: string;
    title: string;
    tags: string;
    duration: number;
    audioUrl: string;
    status: string;
    //歌词
    prompt: string;
    //是否显示状态
    showStatus?: boolean;
    //是否显示歌词
    showPrompt?: boolean;
}

export enum ImgPageType {
    PUBLIC = 'public',
    MY = 'private',
    DALLE_PAINTING = 'dalle_painting',
    MY_THUMB_UP_LIST = 'my_thumb_up_list',
}

export enum MusicPageType {
    PUBLIC = 'public',
    MY = 'private',
    MY_THUMB_UP_LIST = 'my_thumb_up_list',
}

export enum PaintingType {
    MJ = 'mj',
    SD = 'sd',
    DALLE = 'dalle',
    DALLE3 = 'dalle3',
    QRCODE = 'qrcode',
    FACESWAP = 'faceswap'
}