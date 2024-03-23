import express from 'express'
import { MongoClient } from 'mongodb';
import { connectionString, dbName } from '../constants';

export async function getCollection(name: string) {
    const client = new MongoClient(connectionString);
    await client.connect();
    const db = client.db(dbName);
    return db.collection(name);
}
  
export function getErrorMessage(maybeError: unknown) {
  if (
    typeof maybeError === 'object' &&
    maybeError !== null &&
    'message' in maybeError
  ) {
    return maybeError.message;
  }
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

// factory to validate a request
export function validateRequest(requiredQueryParams: string[] = [], requiredBodyParams: string[] = []) {
    return (req: express.Request, res: express.Response, next: (err?: any) => void) => {
      const queryKeys = Object.keys(req.query)
      const isValidQueryParams = requiredQueryParams
        .map(param => queryKeys.includes(param))
        .every(val => !!val)
    
      if (!isValidQueryParams) {
        return res.status(400).json({ error: `Required query params: ${JSON.stringify(requiredQueryParams)}` });
      }
  
      const bodyKeys = Object.keys(req.body)
      const isValidBodyParams = requiredBodyParams
        .map(param => bodyKeys.includes(param))
        .every(val => !!val)
  
      if (!isValidBodyParams) {
        return res.status(400).json({ error: `Required body params: ${JSON.stringify(requiredBodyParams)}` });
      }
    
      next();
      return
    }
  }