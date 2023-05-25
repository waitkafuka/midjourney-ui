export interface ImgCardModel {
    id: number,
    img_url: string,
    prompt: string,
    create_time: Date,
    is_public: number
}

export enum ImgPageType {
    PUBLIC = 'public',
    MY = 'private'
}