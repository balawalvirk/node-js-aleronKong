import {IsMongoId, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    groupName: string;

    @IsOptional()
    @IsString({each: true})
    members: string[];
}
