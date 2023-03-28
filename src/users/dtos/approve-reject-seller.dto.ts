import { IsEnum, IsMongoId } from 'class-validator';
import { SellerRequest } from 'src/types';

export class ApproveRejectSellerDto {
  @IsMongoId()
  user: string;

  @IsEnum(SellerRequest, { each: true })
  sellerRequest: string;
}
