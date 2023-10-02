declare class Series {
    title: string;
    file: string;
    price: number;
}
export declare class CreateProductDto {
    title: string;
    description: string;
    media: string[];
    type: string;
    file?: string;
    price: number;
    status: string;
    quantity: number;
    syncWithAmazon: boolean;
    tags?: string[];
    category: string;
    audioSample?: string;
    asin?: string;
    publicationDate?: Date;
    language?: string;
    fileSize?: number;
    textToSpeech?: boolean;
    enhancedTypeSetting?: boolean;
    xRay?: boolean;
    wordWise?: boolean;
    lending?: boolean;
    printLength?: number;
    webSeries?: boolean;
    series?: Series[];
    simultaneousDeviceUsage?: string;
    availableColors?: string;
    availableSizes?: string;
}
export {};
