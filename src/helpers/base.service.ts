import { FilterQuery, Model, UpdateQuery } from 'mongoose';

export class BaseService {
  constructor(private model: Model<any>) {}

  /**
   * Creates a new document or documents
   * @param data
   */
  create = (data: any) => this.model.create(data);

  /**
   * Inserts one or more new documents as a single insertMany call to the MongoDB server.
   * @param data
   */
  insertMany = (data: any) => this.model.insertMany(data);

  /**
   * Creates a find query: gets a list of documents that match filter.
   * @param filter
   */
  findAll = (filter?: FilterQuery<any>) => this.model.find(filter).lean();

  /**
   * Finds one document.
   *  @param filter
   */
  findOneRecord = (filter?: FilterQuery<any>) => this.model.findOne(filter).lean();

  /**
   * Paginated Data
   * @param condition Paginated
   * @returns Paginations
   */
  paginate = (condition?: FilterQuery<any>, paginate?: {}) =>
    this.model.find(condition, {}, paginate);

  /**
   * Creates a countDocuments query: counts the number of documents that match filter.
   * @param filter
   */
  countDocuments = (filter: FilterQuery<any>) => this.model.countDocuments(filter);

  /**
   * Finds a single document by its _id field.
   * @param id string
   */
  findById = (id: string) => this.model.findById(id).lean();

  /**
   * Finds a single document by its _id field and delete it.
   * @param id string
   */
  findByIdAndDelete = (filter: any) => this.model.findOneAndDelete(filter);

  /**
   * Deletes all of the documents that match conditions from the collection.
   *  @param filter
   */
  deleteMany = (filter?: FilterQuery<any>) => this.model.deleteMany(filter);

  /**
   * Finds a single document and update it.
   * @param id string
   * @param update
   */
  findAndUpdate = (filter: any, update: UpdateQuery<any>) =>
    this.model.findOneAndUpdate(filter, update, { new: true }).lean();
}
