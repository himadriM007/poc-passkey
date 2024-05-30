// routes/databaseRoutes.ts
import express, { Request, Response } from 'express';
import { checkDatabaseConnection } from '../services/dbService';

export const databaseRouter = express.Router();

/**
 * @swagger
 * /database/check-connection:
 *   get:
 *     summary: Check database connection
 *     description: Check the connection to the PostgreSQL database.
 *     responses:
 *       200:
 *         description: Database connection successful
 *       500:
 *         description: Database connection error
 */
databaseRouter.get('/check-connection', async (req: Request, res: Response) => {
  try {
    await checkDatabaseConnection();
    res.status(200).send('Database connection successful');
  } catch (error) {
    res.status(500).send('Database connection error');
  }
});
