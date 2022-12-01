import {
    ClientSession,
    Model,
    PipelineStage,
    PopulateOptions,
    SortOrder,
    Types,
} from 'mongoose';
import { DatabaseBaseRepositoryAbstract } from 'src/common/database/abstracts/database.base-repository.abstract';
import { DATABASE_DELETED_AT_FIELD_NAME } from 'src/common/database/constants/database.constant';
import {
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseRestoreOptions,
    IDatabaseCreateManyOptions,
    IDatabaseManyOptions,
    IDatabaseSoftDeleteManyOptions,
    IDatabaseRestoreManyOptions,
    IDatabaseUpdateOptions,
    IDatabaseDeleteOptions,
} from 'src/common/database/interfaces/database.interface';
import { IDatabaseRepository } from 'src/common/database/interfaces/database.repository.interface';
import { ENUM_PAGINATION_SORT_TYPE } from 'src/common/pagination/constants/pagination.enum.constant';
import { IPaginationSort } from 'src/common/pagination/interfaces/pagination.interface';

export abstract class DatabaseMongoObjectIdRepositoryAbstract<T>
    extends DatabaseBaseRepositoryAbstract<T>
    implements IDatabaseRepository<T>
{
    protected _repository: Model<T>;
    protected _joinOnFind?: PopulateOptions | PopulateOptions[];

    constructor(
        repository: Model<T>,
        options?: PopulateOptions | PopulateOptions[]
    ) {
        super();

        this._repository = repository;
        this._joinOnFind = options;
    }

    private _convertSort(sort: IPaginationSort): Record<string, number> {
        const data: Record<string, number> = {};
        Object.keys(sort).forEach((val) => {
            data[val] = sort[val] === ENUM_PAGINATION_SORT_TYPE.ASC ? 1 : -1;
        });

        return data;
    }

    async findAll<Y = T>(
        find?: Record<string, any> | Record<string, any>[],
        options?: IDatabaseFindAllOptions<ClientSession>
    ): Promise<Y[]> {
        const findAll = this._repository.find(find);

        if (options && options.withDeleted) {
            findAll.where(DATABASE_DELETED_AT_FIELD_NAME).exists(true);
        } else {
            findAll.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
        }

        if (options && options.select) {
            findAll.select(options.select);
        }

        if (options && options.paging) {
            findAll.limit(options.paging.limit).skip(options.paging.skip);
        }

        if (options && options.sort) {
            findAll.sort(
                this._convertSort(options.sort) as { [key: string]: SortOrder }
            );
        }

        if (options && options.join) {
            findAll.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            findAll.session(options.session);
        }

        return findAll.lean();
    }

    async findOne<Y = T>(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseFindOneOptions<ClientSession>
    ): Promise<Y> {
        const findOne = this._repository.findOne(find);

        if (options && options.withDeleted) {
            findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(true);
        } else {
            findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
        }

        if (options && options.select) {
            findOne.select(options.select);
        }

        if (options && options.join) {
            findOne.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            findOne.session(options.session);
        }

        if (options && options.sort) {
            findOne.sort(
                this._convertSort(options.sort) as { [key: string]: SortOrder }
            );
        }

        return findOne.lean();
    }

    async findOneById<Y = T>(
        _id: string,
        options?: IDatabaseFindOneOptions<ClientSession>
    ): Promise<Y> {
        const findOne = this._repository.findById(_id);

        if (options && options.withDeleted) {
            findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(true);
        } else {
            findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
        }

        if (options && options.select) {
            findOne.select(options.select);
        }

        if (options && options.join) {
            findOne.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            findOne.session(options.session);
        }

        if (options && options.sort) {
            findOne.sort(
                this._convertSort(options.sort) as { [key: string]: SortOrder }
            );
        }

        return findOne.lean();
    }

    async getTotal(
        find?: Record<string, any> | Record<string, any>[],
        options?: IDatabaseOptions<ClientSession>
    ): Promise<number> {
        const count = this._repository.countDocuments(find);

        if (options && options.withDeleted) {
            count.where(DATABASE_DELETED_AT_FIELD_NAME).exists(true);
        } else {
            count.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
        }

        if (options && options.session) {
            count.session(options.session);
        }

        if (options && options.join) {
            count.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        return count;
    }

    async exists(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseExistOptions<ClientSession>
    ): Promise<boolean> {
        const exist = this._repository.exists({
            ...find,
            _id: {
                $nin:
                    options && options.excludeId
                        ? options.excludeId.map(
                              (val) => new Types.ObjectId(val)
                          )
                        : [],
            },
        });

        if (options && options.withDeleted) {
            exist.where(DATABASE_DELETED_AT_FIELD_NAME).exists(true);
        } else {
            exist.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
        }

        if (options && options.session) {
            exist.session(options.session);
        }

        if (options && options.join) {
            exist.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        const result = await exist;
        return result ? true : false;
    }

    async raw<N, R = PipelineStage[]>(rawOperation: R): Promise<N[]> {
        if (!Array.isArray(rawOperation)) {
            throw new Error('Must in array');
        }

        return this._repository.aggregate<N>(rawOperation);
    }

    async create<N>(
        data: N,
        options?: IDatabaseCreateOptions<ClientSession>
    ): Promise<T> {
        const dataCreate: Record<string, any> = data;
        dataCreate._id = new Types.ObjectId(options && options._id);

        const create = await this._repository.create([dataCreate], {
            session: options ? options.session : undefined,
        });

        return create[0];
    }

    async updateOneById<N>(
        _id: string,
        data: N,
        options?: IDatabaseUpdateOptions<ClientSession>
    ): Promise<T> {
        const update = this._repository
            .findByIdAndUpdate(
                _id,
                {
                    $set: data,
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.join) {
            update.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            update.session(options.session);
        }

        return update;
    }

    async updateOne<N>(
        find: Record<string, any> | Record<string, any>[],
        data: N,
        options?: IDatabaseUpdateOptions<ClientSession>
    ): Promise<T> {
        const update = this._repository
            .findOneAndUpdate(
                find,
                {
                    $set: data,
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.join) {
            update.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            update.session(options.session);
        }

        return update;
    }

    async deleteOne(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseDeleteOptions<ClientSession>
    ): Promise<T> {
        const del = this._repository.findOneAndDelete(find, { new: true });

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            del.session(options.session);
        }

        return del;
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseDeleteOptions<ClientSession>
    ): Promise<T> {
        const del = this._repository.findByIdAndDelete(_id, {
            new: true,
        });

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            del.session(options.session);
        }

        return del;
    }

    async softDeleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions<ClientSession>
    ): Promise<T> {
        const del = this._repository
            .findByIdAndUpdate(
                _id,
                {
                    $set: { deletedAt: new Date() },
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            del.session(options.session);
        }

        return del;
    }

    async softDeleteOne(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseSoftDeleteOptions<ClientSession>
    ): Promise<T> {
        const del = this._repository
            .findOneAndUpdate(
                find,
                {
                    $set: { deletedAt: new Date() },
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            del.session(options.session);
        }

        return del;
    }

    async restoreOneById(
        _id: string,
        options?: IDatabaseRestoreOptions<ClientSession>
    ): Promise<T> {
        const rest = this._repository
            .findByIdAndUpdate(
                _id,
                {
                    $set: { deletedAt: undefined },
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(true);

        if (options && options.join) {
            rest.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            rest.session(options.session);
        }

        return rest;
    }

    async restoreOne(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseRestoreOptions<ClientSession>
    ): Promise<T> {
        const rest = this._repository
            .findByIdAndUpdate(
                find,
                {
                    $set: { deletedAt: undefined },
                },
                { new: true }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(true);

        if (options && options.join) {
            rest.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        if (options && options.session) {
            rest.session(options.session);
        }

        return rest;
    }

    // bulk
    async createMany<N>(
        data: N[],
        options?: IDatabaseCreateManyOptions<ClientSession>
    ): Promise<boolean> {
        const dataCreate: Record<string, any>[] = data.map(
            (val: Record<string, any>) => ({
                ...val,
                _id: new Types.ObjectId(val._id),
            })
        );

        const create = this._repository.insertMany(dataCreate, {
            session: options ? options.session : undefined,
        });

        try {
            await create;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async deleteManyByIds(
        _id: string[],
        options?: IDatabaseManyOptions<ClientSession>
    ): Promise<boolean> {
        const del = this._repository
            .deleteMany({
                _id: {
                    $in: _id.map((val) => new Types.ObjectId(val)),
                },
            })
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.session) {
            del.session(options.session);
        }

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await del;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async deleteMany(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseManyOptions<ClientSession>
    ): Promise<boolean> {
        const del = this._repository
            .deleteMany(find)
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.session) {
            del.session(options.session);
        }

        if (options && options.join) {
            del.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await del;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async softDeleteManyByIds(
        _id: string[],
        options?: IDatabaseSoftDeleteManyOptions<ClientSession>
    ): Promise<boolean> {
        const softDel = this._repository
            .updateMany(
                {
                    _id: {
                        $in: _id.map((val) => new Types.ObjectId(val)),
                    },
                },
                {
                    $set: {
                        deletedAt: new Date(),
                    },
                }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.session) {
            softDel.session(options.session);
        }

        if (options && options.join) {
            softDel.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await softDel;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async softDeleteMany(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseSoftDeleteManyOptions<ClientSession>
    ): Promise<boolean> {
        const softDel = this._repository
            .updateMany(find, {
                $set: {
                    deletedAt: new Date(),
                },
            })
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.session) {
            softDel.session(options.session);
        }

        if (options && options.join) {
            softDel.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await softDel;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async restoreManyByIds(
        _id: string[],
        options?: IDatabaseRestoreManyOptions<ClientSession>
    ): Promise<boolean> {
        const rest = this._repository
            .updateMany(
                {
                    _id: {
                        $in: _id.map((val) => new Types.ObjectId(val)),
                    },
                },
                {
                    $set: {
                        deletedAt: undefined,
                    },
                }
            )
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(true);

        if (options && options.session) {
            rest.session(options.session);
        }

        if (options && options.join) {
            rest.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await rest;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async restoreMany(
        find: Record<string, any> | Record<string, any>[],
        options?: IDatabaseRestoreManyOptions<ClientSession>
    ): Promise<boolean> {
        const rest = this._repository
            .updateMany(find, {
                $set: {
                    deletedAt: undefined,
                },
            })
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(true);

        if (options && options.session) {
            rest.session(options.session);
        }

        if (options && options.join) {
            rest.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await rest;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async updateMany<N>(
        find: Record<string, any> | Record<string, any>[],
        data: N,
        options?: IDatabaseManyOptions<ClientSession>
    ): Promise<boolean> {
        const update = this._repository
            .updateMany(find, {
                $set: data,
            })
            .where(DATABASE_DELETED_AT_FIELD_NAME)
            .exists(false);

        if (options && options.session) {
            update.session(options.session as ClientSession);
        }

        if (options && options.join) {
            update.populate(
                typeof options.join === 'boolean'
                    ? this._joinOnFind
                    : (options.join as PopulateOptions | PopulateOptions[])
            );
        }

        try {
            await update;
            return true;
        } catch (err: unknown) {
            throw err;
        }
    }

    async model<N = T>(): Promise<N> {
        return this._repository as N;
    }
}
