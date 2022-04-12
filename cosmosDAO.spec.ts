import { CosmosDAO } from './cosmosDAO';
import { testDAO, RestApiDAO } from '@hawryschuk/dao';
import { BusinessModel } from '@hawryschuk/redaction';
import { SampleDAO } from '@hawryschuk/dao/DAO.spec.exports';
import { testBusinessModel } from '@hawryschuk/redaction/business.model.spec.exports';

testBusinessModel({
    title: 'Business Model : CosmosDB over REST API',
    business: new BusinessModel(RestApiDAO, 'http://localhost:3000'),
});
