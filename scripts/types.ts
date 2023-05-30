export interface ImgCardModel {
    id: number,
    img_url: string,
    prompt: string,
    create_time: Date,
    is_public: number,
    thumb_up_count: number,
    painting_type: PaintingType,
}

export enum ImgPageType {
    PUBLIC = 'public',
    MY = 'private'
}

export enum PaintingType {
    MJ = 'mj',
    SD = 'sd',
    DALLE = 'dalle'
}