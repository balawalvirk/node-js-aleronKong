"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(model) {
        this.model = model;
        this.createRecord = (data) => this.model.create(data);
        this.insertManyRecords = (data) => this.model.insertMany(data);
        this.findAllRecords = (filter, options) => this.model.find(filter, {}, options);
        this.findOneRecord = (filter) => this.model.findOne(filter);
        this.countRecords = (filter) => this.model.countDocuments(filter);
        this.findRecordById = (id) => this.model.findById(id);
        this.deleteSingleRecord = (filter) => this.model.findOneAndDelete(filter);
        this.deleteManyRecord = (filter) => this.model.deleteMany(filter);
        this.findOneRecordAndUpdate = (filter, update) => this.model.findOneAndUpdate(filter, update, { new: true });
        this.updateManyRecords = (filter, update) => this.model.updateMany(filter, update, { new: true });
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base.service.js.map