import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';

export class BaseService<T> {
  constructor(private model: Model<T>) {}

  /**
   * Creates a new document or documents
   * @param data
   */
  createRecord = (data: T | {}) => this.model.create(data);

  /**
   * Inserts one or more new documents as a single insertMany call to the MongoDB server.
   * @param data
   */
  insertManyRecords = (data: T | {}) => this.model.insertMany(data);

  /**
   * Creates a find query: gets a list of documents that match filter.
   * @param filter
   */
  findAllRecords = (filter?: FilterQuery<T>, options?: QueryOptions<T>) => this.model.find(filter, {}, options).lean();

  /**
   * Finds one document.
   *  @param filter
   */
  findOneRecord = (filter?: FilterQuery<T>) => this.model.findOne(filter).lean();

  /**
   * Paginated Data
   * @param condition Paginated
   * @returns Paginations
   */
  paginate = (condition?: FilterQuery<T>, paginate?: QueryOptions<T>) =>
    this.model.find(condition, {}, paginate).lean();

  /**
   * Creates a countDocuments query: counts the number of documents that match filter.
   * @param filter
   */
  countRecords = (filter: FilterQuery<T>) => this.model.countDocuments(filter).lean();

  /**
   * Finds a single document by its _id field.
   * @param id string
   */
  findRecordById = (id: string) => this.model.findById(id);

  /**
   * Finds a single document by its _id field and delete it.
   * @param filter
   */
  deleteSingleRecord = (filter: FilterQuery<T>) => this.model.findOneAndDelete(filter);

  /**
   * Deletes all of the documents that match conditions from the collection.
   *  @param filter
   */
  deleteManyRecord = (filter?: FilterQuery<T>) => this.model.deleteMany(filter);

  /**
   * Finds a single document and update it.
   * @param filter
   * @param update
   */
  findOneRecordAndUpdate = (filter: FilterQuery<T>, update: UpdateQuery<T>) =>
    this.model.findOneAndUpdate(filter, update, { new: true }).lean();

  updateManyRecords = (filter?: FilterQuery<T>, update?: UpdateQuery<T>) =>
    this.model.updateMany(filter, update, { new: true });
}
