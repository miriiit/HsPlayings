import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { HelperModule } from 'src/common/helper/helper.module';
import { ConfigModule } from '@nestjs/config';
import configs from 'src/configs';
import { ApiKeyService } from 'src/common/api-key/services/api-key.service';
import { ApiKeyBulkKeyService } from 'src/common/api-key/services/api-key.bulk.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { DatabaseOptionsModule } from 'src/common/database/database.options.module';
import { DatabaseOptionsService } from 'src/common/database/services/database.options.service';
import {
    IApiKey,
    IApiKeyRequestHashedData,
} from 'src/common/api-key/interfaces/api-key.interface';
import { ApiKeyModule } from 'src/common/api-key/api-key.module';
import { ApiKeyEntity } from 'src/common/api-key/repository/entities/api-key.entity';
import { ENUM_PAGINATION_SORT_TYPE } from 'src/common/pagination/constants/pagination.enum.constant';

describe('ApiKeyService', () => {
    let apiKeyService: ApiKeyService;
    let apiKeyBulkService: ApiKeyBulkKeyService;
    const authApiName: string = faker.random.alphaNumeric(5);

    let authApi: IApiKey;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    connectionName: DATABASE_CONNECTION_NAME,
                    imports: [DatabaseOptionsModule],
                    inject: [DatabaseOptionsService],
                    useFactory: (
                        databaseOptionsService: DatabaseOptionsService
                    ) => databaseOptionsService.createOptions(),
                }),
                ConfigModule.forRoot({
                    load: configs,
                    isGlobal: true,
                    cache: true,
                    envFilePath: ['.env'],
                    expandVariables: true,
                }),
                HelperModule,
                ApiKeyModule,
            ],
            providers: [],
        }).compile();

        apiKeyService = moduleRef.get<ApiKeyService>(ApiKeyService);
        apiKeyBulkService =
            moduleRef.get<ApiKeyBulkKeyService>(ApiKeyBulkKeyService);

        authApi = await apiKeyService.create({
            name: authApiName,
            description: faker.random.alphaNumeric(),
        });
    });

    describe('create', () => {
        it('should return an success', async () => {
            const data = {
                name: authApiName,
                description: faker.random.alphaNumeric(),
            };

            const result: IApiKey = await apiKeyService.create(data);
            jest.spyOn(apiKeyService, 'create').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.create(data)).toBe(result);
        });
    });

    describe('createRaw', () => {
        it('should return an success', async () => {
            const data = {
                name: authApiName,
                description: faker.random.alphaNumeric(),
                key: await apiKeyService.createKey(),
                secret: await apiKeyService.createSecret(),
                passphrase: await apiKeyService.createPassphrase(),
                encryptionKey: await apiKeyService.createEncryptionKey(),
            };

            const result: IApiKey = await apiKeyService.createRaw(data);
            jest.spyOn(apiKeyService, 'createRaw').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createRaw(data)).toBe(result);
        });
    });

    describe('getTotal', () => {
        it('should return an success', async () => {
            const result: number = await apiKeyService.getTotal({});
            jest.spyOn(apiKeyService, 'getTotal').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.getTotal({})).toBe(result);
        });
    });

    describe('findOneById', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );
            jest.spyOn(apiKeyService, 'findOneById').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.findOneById(`${authApi._id}`)).toBe(
                result
            );
        });
    });

    describe('findOne', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.findOne({
                _id: authApi._id,
            });
            jest.spyOn(apiKeyService, 'findOne').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.findOne({ _id: authApi._id })).toBe(
                result
            );
        });
    });

    describe('findOneByKey', () => {
        it('should return an success', async () => {
            const findOne: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );

            const result: ApiKeyEntity = await apiKeyService.findOneByKey(
                findOne.key
            );
            jest.spyOn(apiKeyService, 'findOneByKey').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.findOneByKey(findOne.key)).toBe(result);
        });
    });

    describe('inactive', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.inactive(
                `${authApi._id}`
            );
            jest.spyOn(apiKeyService, 'inactive').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.inactive(`${authApi._id}`)).toBe(result);
        });
    });

    describe('active', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.active(
                `${authApi._id}`
            );
            jest.spyOn(apiKeyService, 'active').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.active(`${authApi._id}`)).toBe(result);
        });
    });

    describe('findAll', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity[] = await apiKeyService.findAll(
                {},
                { paging: { limit: 1, skip: 1 } }
            );
            jest.spyOn(apiKeyService, 'findAll').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.findAll(
                    {},
                    { paging: { limit: 1, skip: 1 } }
                )
            ).toBe(result);
        });

        it('should return an success with limit and offset', async () => {
            const result: ApiKeyEntity[] = await apiKeyService.findAll(
                {},
                { paging: { limit: 1, skip: 1 } }
            );
            jest.spyOn(apiKeyService, 'findAll').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.findAll(
                    {},
                    { paging: { limit: 1, skip: 1 } }
                )
            ).toBe(result);
        });

        it('should return an success with limit, offset, and sort', async () => {
            const result: ApiKeyEntity[] = await apiKeyService.findAll(
                {},
                {
                    paging: { limit: 1, skip: 1 },
                    sort: { name: ENUM_PAGINATION_SORT_TYPE.ASC },
                }
            );
            jest.spyOn(apiKeyService, 'findAll').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.findAll(
                    {},
                    {
                        paging: { limit: 1, skip: 1 },
                        sort: { name: ENUM_PAGINATION_SORT_TYPE.ASC },
                    }
                )
            ).toBe(result);
        });
    });

    describe('updateOneById', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.updateOneById(
                `${authApi._id}`,
                {
                    name: faker.random.alphaNumeric(10),
                    description: faker.random.alphaNumeric(20),
                }
            );
            jest.spyOn(apiKeyService, 'updateOneById').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.updateOneById(`${authApi._id}`, {
                    name: faker.random.alphaNumeric(10),
                    description: faker.random.alphaNumeric(20),
                })
            ).toBe(result);
        });
    });

    describe('updateHashById', () => {
        it('should return an success', async () => {
            const result: IApiKey = await apiKeyService.updateHashById(
                `${authApi._id}`
            );
            jest.spyOn(apiKeyService, 'updateHashById').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.updateHashById(`${authApi._id}`)).toBe(
                result
            );
        });
    });

    describe('deleteOneById', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.deleteOneById(
                `${authApi._id}`
            );
            jest.spyOn(apiKeyService, 'deleteOneById').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.deleteOneById(`${authApi._id}`)).toBe(
                result
            );
        });
    });

    describe('deleteOne', () => {
        it('should return an success', async () => {
            const result: ApiKeyEntity = await apiKeyService.deleteOne({
                _id: `${authApi._id}`,
            });
            jest.spyOn(apiKeyService, 'deleteOne').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.deleteOne({ _id: `${authApi._id}` })
            ).toBe(result);
        });
    });

    describe('createKey', () => {
        it('should return an success', async () => {
            const result: string = await apiKeyService.createKey();
            jest.spyOn(apiKeyService, 'createKey').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createKey()).toBe(result);
        });
    });

    describe('createEncryptionKey', () => {
        it('should return an success', async () => {
            const result: string = await apiKeyService.createEncryptionKey();
            jest.spyOn(apiKeyService, 'createEncryptionKey').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createEncryptionKey()).toBe(result);
        });
    });

    describe('createSecret', () => {
        it('should return an success', async () => {
            const result: string = await apiKeyService.createSecret();
            jest.spyOn(apiKeyService, 'createSecret').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createSecret()).toBe(result);
        });
    });

    describe('createPassphrase', () => {
        it('should return an success', async () => {
            const result: string = await apiKeyService.createPassphrase();
            jest.spyOn(apiKeyService, 'createPassphrase').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createPassphrase()).toBe(result);
        });
    });

    describe('createHashApiKey', () => {
        it('should return an success', async () => {
            const key = faker.random.alpha(5);
            const secret = faker.random.alpha(10);
            const result: string = await apiKeyService.createHashApiKey(
                key,
                secret
            );
            jest.spyOn(apiKeyService, 'createHashApiKey').mockImplementation(
                async () => result
            );

            expect(await apiKeyService.createHashApiKey(key, secret)).toBe(
                result
            );
        });
    });

    describe('validateHashApiKey', () => {
        it('should return an success', async () => {
            const findOne: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );
            const hashFormRequest = findOne.hash;
            const result: boolean = await apiKeyService.validateHashApiKey(
                hashFormRequest,
                hashFormRequest
            );
            jest.spyOn(apiKeyService, 'validateHashApiKey').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.validateHashApiKey(
                    hashFormRequest,
                    hashFormRequest
                )
            ).toBe(result);
        });

        it('should return an failed', async () => {
            const findOne: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );
            const hashFormRequest = findOne.hash;
            const hashWrong = faker.random.alphaNumeric(10);
            const result: boolean = await apiKeyService.validateHashApiKey(
                hashFormRequest,
                hashWrong
            );
            jest.spyOn(apiKeyService, 'validateHashApiKey').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.validateHashApiKey(
                    hashFormRequest,
                    hashWrong
                )
            ).toBe(result);
        });
    });

    describe('decryptApiKey', () => {
        it('should return an success', async () => {
            const findOne: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );
            const timestamp = new Date().valueOf();
            const apiHash = await apiKeyService.createHashApiKey(
                findOne.key,
                authApi.secret
            );
            const encryptedApiKey: string = await apiKeyService.encryptApiKey(
                {
                    key: findOne.key,
                    timestamp,
                    hash: apiHash,
                },
                findOne.encryptionKey,
                authApi.passphrase
            );

            const result: IApiKeyRequestHashedData =
                await apiKeyService.decryptApiKey(
                    encryptedApiKey,
                    findOne.encryptionKey,
                    authApi.passphrase
                );

            jest.spyOn(apiKeyService, 'decryptApiKey').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.decryptApiKey(
                    encryptedApiKey,
                    findOne.encryptionKey,
                    authApi.passphrase
                )
            ).toBe(result);
        });
    });

    describe('encryptApiKey', () => {
        it('should return an success', async () => {
            const findOne: ApiKeyEntity = await apiKeyService.findOneById(
                `${authApi._id}`
            );

            const timestamp = new Date().valueOf();
            const apiHash = await apiKeyService.createHashApiKey(
                findOne.key,
                authApi.secret
            );
            const result: string = await apiKeyService.encryptApiKey(
                {
                    key: findOne.key,
                    timestamp,
                    hash: apiHash,
                },
                findOne.encryptionKey,
                authApi.passphrase
            );
            jest.spyOn(apiKeyService, 'encryptApiKey').mockImplementation(
                async () => result
            );

            expect(
                await apiKeyService.encryptApiKey(
                    {
                        key: findOne.key,
                        timestamp,
                        hash: apiHash,
                    },
                    findOne.encryptionKey,
                    authApi.passphrase
                )
            ).toBe(result);
        });
    });

    afterEach(async () => {
        try {
            await apiKeyService.deleteOne({
                _id: authApi._id,
            });
            await apiKeyBulkService.deleteMany({
                name: authApiName,
            });
        } catch (e) {
            console.error(e);
        }
    });
});
