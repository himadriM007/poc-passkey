// services/dbService.ts
import { Pool, QueryResult } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: true,
});

export const checkDatabaseConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (error: any) {
    throw new Error(`Database connection error: ${error.message}`);
  }
};

// Function to call a PostgreSQL function and return data
export const callDatabaseFunction = async (
  functionName: string,
  params: any[] = []
): Promise<any[] | boolean> => {
  try {
    const client = await pool.connect();
    const result: QueryResult = await client.query(
      `SELECT * FROM ${functionName}($1)`,
      params
    );
    client.release();

    const response = result.rows[0][`${functionName}`];

    if (response.msg_id === 1) {
      return response.data === undefined ? true : response.data;
    }
    return [];
  } catch (error: any) {
    throw new Error(
      `Error calling database function ${functionName}: ${error.message}`
    );
  }
};
