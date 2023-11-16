import {PartialType} from '@nestjs/mapped-types';
import {CreateGuildDto} from "./create-guild.dto";
import {IsBoolean, IsOptional} from "class-validator";

export class UpdateGuildDto extends PartialType(CreateGuildDto) {
}


export class UpdatePackageBenefit {
    @IsBoolean()
    @IsOptional()
    benefitDelivered;


    @IsBoolean()
    @IsOptional()
    isEligible;
}
