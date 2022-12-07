import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Report, ReportDocument } from './report.schema';

@Injectable()
export class ReportService extends BaseService {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {
    super(reportModel);
  }
}
