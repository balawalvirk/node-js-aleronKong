import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectId implements PipeTransform<string> {
  transform(value: string): string {
    if (Types.ObjectId.isValid(value)) {
      if (String(new Types.ObjectId(value)) === value) return value;
      throw new BadRequestException('Param passed is not a valid object id');
    }
    throw new BadRequestException('Param passed is not a valid object id');
  }
}
