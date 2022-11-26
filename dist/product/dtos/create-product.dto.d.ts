export declare class CreateProductDto {
    title: string;
    description: string;
    media: string[];
    state: string;
    file?: string;
    price: number;
    type: string;
    quantity: number;
    syncWithAmazon: boolean;
    tags?: string[];
}
