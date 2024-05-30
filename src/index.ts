// index.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import * as dotenv from 'dotenv';

import router from './routes';
import { databaseRouter } from './routes/databaseRouter';

dotenv.config();
const app = express();
const swaggerDocument = YAML.load('./swagger/swagger.yaml');

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', router);
app.use('/api/database', databaseRouter);

const PORT = process.env.PORT ?? 6000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
