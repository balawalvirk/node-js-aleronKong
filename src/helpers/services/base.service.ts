import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';

export class BaseService {
  constructor(private model: Model<any>) {}

  /**
   * Creates a new document or documents
   * @param data
   */
  createRecord = (data: any) => this.model.create(data);

  /**
   * Inserts one or more new documents as a single insertMany call to the MongoDB server.
   * @param data
   */
  insertManyRecords = (data: any) => this.model.insertMany(data);

  /**
   * Creates a find query: gets a list of documents that match filter.
   * @param filter
   */
  findAllRecords = (filter?: FilterQuery<any>) => this.model.find(filter).sort({ createdAt: -1 });

  /**
   * Finds one document.
   *  @param filter
   */
  findOneRecord = (filter?: FilterQuery<any>) => this.model.findOne(filter);

  /**
   * Paginated Data
   * @param condition Paginated
   * @returns Paginations
   */
  paginate = (condition?: FilterQuery<any>, paginate?: QueryOptions<any>) =>
    this.model.find(condition, {}, paginate);

  /**
   * Creates a countDocuments query: counts the number of documents that match filter.
   * @param filter
   */
  countRecords = (filter: FilterQuery<any>) => this.model.countDocuments(filter);

  /**
   * Finds a single document by its _id field.
   * @param id string
   */
  findRecordById = (id: string) => this.model.findById(id);

  /**
   * Finds a single document by its _id field and delete it.
   * @param filter
   */
  deleteSingleRecord = (filter: FilterQuery<any>) => this.model.findOneAndDelete(filter);

  /**
   * Deletes all of the documents that match conditions from the collection.
   *  @param filter
   */
  deleteManyRecord = (filter?: FilterQuery<any>) => this.model.deleteMany(filter);

  /**
   * Finds a single document and update it.
   * @param filter
   * @param update
   */
  findOneRecordAndUpdate = (filter: FilterQuery<any>, update: UpdateQuery<any>) =>
    this.model.findOneAndUpdate(filter, update, { new: true });

  updateManyRecords = (filter?: FilterQuery<any>, update?: UpdateQuery<any>) =>
    this.model.updateMany(filter, update, { new: true });
}
