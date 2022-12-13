import { PartialType } from '@nestjs/mapped-types';
import { CreateGuildPackageDto } from './create-guild-package.dto';

export class UpdateGuildPackageDto extends PartialType(CreateGuildPackageDto) {}
