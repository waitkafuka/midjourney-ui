export interface ImgCardModel {
    id: number,
    img_url: string,
    prompt: string,
    create_time: Date,
    is_public: number,
    thumb_up_count: number,
}

export enum ImgPageType {
    PUBLIC = 'public',
    MY = 'private'
}