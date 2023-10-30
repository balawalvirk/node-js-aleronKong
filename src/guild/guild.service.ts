import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {Guild, GuildDocument} from "src/guild/guild.schema";

@Injectable()
export class GuildService extends BaseService<GuildDocument> {
  constructor(@InjectModel(Guild.name) private GuildModel: Model<GuildDocument>) {
    super(GuildModel);
  }

  async findAllAuthors(userId: string) {
    return await this.GuildModel.find({ buyers: { $in: [userId] }, isGuildPackage: false })
      .populate([
        {
          path: 'creator',
          select: 'firstName lastName avatar',
        },
      ])
      .select('creator price');
  }
}
