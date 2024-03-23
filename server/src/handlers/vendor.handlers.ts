import { Request, Response } from 'express'
import { getCollection, getErrorMessage, validateRequest } from "../utils/utils"
import { collections } from '../constants'


export const getVendor = {
  v1: {
    endpoint: '/v1/vendor',
    validation: validateRequest(['vendorId']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']
        const bookings = await getCollection(collections.vendors)
        const result = await bookings.findOne({ vendorId })
        console.log(result);
        res.send(result); 
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}