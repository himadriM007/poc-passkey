import { Request, Response, NextFunction } from 'express';

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('An error occurred:', error);
  res.status(500).json({ error: 'Internal Server Error' });
};
