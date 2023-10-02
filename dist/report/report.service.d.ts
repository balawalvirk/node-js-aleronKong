import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { ReportDocument } from './report.schema';
export declare class ReportService extends BaseService<ReportDocument> {
    private reportModel;
    constructor(reportModel: Model<ReportDocument>);
}
