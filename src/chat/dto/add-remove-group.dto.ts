import {IsMongoId, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class AddRemoveGroupDto {

    @IsNotEmpty()
    @IsString({each: true})
    members: string[];
}
