import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Package, PackageDocument } from './package.schema';

@Injectable()
export class PackageService extends BaseService {
  constructor(@InjectModel(Package.name) private PackageModel: Model<PackageDocument>) {
    super(PackageModel);
  }

  async findAllAuthors(userId: string) {
    const pkgs = await this.PackageModel.find({ buyers: { $in: [userId] } })
      .populate([
        {
          path: 'creator',
          select: 'firstName lastName avatar',
        },
      ])
      .select('creator price');
    // filter repeating users and remove them
    const uniquePackages = [...new Map(pkgs.map((pkg) => [pkg['_id'], pkg])).values()];
    return uniquePackages;
  }
}
