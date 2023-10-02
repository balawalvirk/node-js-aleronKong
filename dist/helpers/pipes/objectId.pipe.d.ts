import { PipeTransform } from '@nestjs/common';
export declare class ParseObjectId implements PipeTransform<string> {
    transform(value: string): string;
}
