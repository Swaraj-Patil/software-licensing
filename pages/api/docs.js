import swaggerUi from 'swagger-ui-express';
import { serve, setup } from 'swagger-ui-express';
import { createSwaggerSpec } from '../../utils/swagger';
import express from 'express';

const app = express();
const spec = createSwaggerSpec();

app.use('/api/docs', serve);
app.use('/api/docs', setup(spec));

export default app;
