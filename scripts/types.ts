export interface ImgCardModel {
    id: number,
    img_url: string | null,
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

export enum ImgPageType {
    PUBLIC = 'public',
    MY = 'private',
    DALLE_PAINTING = 'dalle_painting',
}

export enum PaintingType {
    MJ = 'mj',
    SD = 'sd',
    DALLE = 'dalle',
    QRCODE = 'qrcode',
    FACESWAP = 'faceswap'
}