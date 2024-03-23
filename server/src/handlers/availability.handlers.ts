import { Request, Response } from 'express'
import { getCollection, getErrorMessage, validateRequest } from '../utils/utils'
import { ObjectId } from 'mongodb'
import { collections } from '../constants'

export const requestOff = {
  v1: {
    endpoint: '/v1/request-off',
    validation: validateRequest(['vendorId', 'providerId'], ['date']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const providerId = req.query['providerId']!
        const date = new Date(req.body['date'])
        const update = { ...req.body, date }
        const collection = await getCollection(collections.availablity)
        const result = await collection.findOneAndUpdate({vendorId, providerId: new ObjectId(providerId.toString())}, { $push: { unavailableRequests: update }})
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const getAvailability = {
  v1: {
    endpoint: '/v1/availability',
    validation: validateRequest(['vendorId']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']
        const availability = await getCollection(collections.availablity)
        const providerId = req.query['providerId']
        const result = providerId
          ? await availability
            .findOne({ vendorId, providerId: new ObjectId(providerId.toString()) })
          : await availability
            .find({ vendorId })
            .project({ vendorId: 0 })
            .toArray()
  
        // REMOVE vendorId FROM SINGLE RESULT
        console.log(result);
        res.send(result); 
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const initializeAvailability = async (providerId: ObjectId, vendorData: any) => {
    const availability = await getCollection(collections.availablity);
    return availability.insertOne({
      providerId,
      vendorId: vendorData?.vendorId,
      defaultSchedule: vendorData?.['defaultSchedule'],
      unavailableRequests: [],
    });
}

export const removeAvailablity = async (providerId: ObjectId, vendorId: string ) => {
  const availability = await getCollection(collections.availablity);
  return availability.deleteOne({ providerId, vendorId })
}
