import {IsMongoId, IsOptional, IsString} from 'class-validator';

export class CreateContactusDto {
    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    description: string;
}
