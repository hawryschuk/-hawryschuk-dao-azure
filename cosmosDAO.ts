// const DocumentClient = require('documentdb-q-promises').DocumentClientWrapper;
import { CosmosClient, Container } from '@azure/cosmos';
import { DAO, Model } from '@hawryschuk/dao';
const config = require('./config');

export class CosmosDAO extends DAO {
    constructor(models: any) { super(models); }

    /** CosmosDB Database-Collection for each Model */
    container$ = (() => {
        const client = new CosmosClient({ endpoint: config.host, key: config.authKey });
        const databaseId = config.databaseId;
        const database$ = client.databases.createIfNotExists({ id: databaseId }).then(r => r.database);
        return Object.keys(this.models).reduce((a, klassName) => {
            a[klassName] = database$.then(database => database.containers.createIfNotExists({ id: klassName }, { offerThroughput: 400 }).then(r => r.container));
            return a;
        }, {} as { [key: string]: Promise<Container> });
    })();

    async create<T extends Model>(klass: any, data: T): Promise<T> {
        const object = await super.create(klass, data);
        const resource = await this.container$[klass.name].then(container => container.items.upsert(object.POJO()));
        return object;
    }

    async delete(klass: any, id: string, fromObject?: boolean) {
        const object = await super.delete(klass, id, fromObject, true);
        const resource = await this.container$[klass.name].then(container => container.item(id).delete(object.POJO()));
        return object;
    }

    async update<M extends Model>(klass: any, id: string, data: M): Promise<M> {
        const object: M = await super.update(klass, id, data);
        const resource = await this.container$[klass.name].then(container => container.item(id).replace(object.POJO()));
        return object;
    }

    async getOnline(klass: any, id = '', from = ''): Promise<Model | { [id: string]: Model }> {
        await super.getOnline(klass, id);
        const doc2obj = async (doc: any): Promise<Model> => {
            const model = new klass({ ...doc });
            await model.ready$;
            return model
        };
        const { resources } = await this
            .container$[klass.name]
            .then(container => container.items.query(
                id
                    ? { query: "SELECT * FROM root r WHERE r.id = @id", parameters: [{ name: "@id", value: id }] }
                    : { query: 'select * from root r', parameters: [] }
            ).fetchAll());
        const models: Model[] = await Promise.all(resources.map(doc2obj));
        return id ? models[0] : models.reduce((all, model) => ({ ...all, [model.id]: model }), {});
    }
}
