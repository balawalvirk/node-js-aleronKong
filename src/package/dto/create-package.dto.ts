import {isArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreatePackageDto {
    @IsString()
    title: string;

    @IsString()
    media: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsBoolean()
    isGuildPackage?: boolean;


    @IsOptional()
    @IsMongoId()
    guild: string;


    @IsOptional()
    @IsBoolean()
    isEligible?: boolean;


    @IsOptional()
    @IsBoolean()
    benefitDelivered?: boolean;


    @IsOptional()
    @IsString({ each: true })
    benefits;

}
