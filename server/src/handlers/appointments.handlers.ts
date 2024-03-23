import { Request, Response } from 'express'
import { ObjectId } from "mongodb"
import { getCollection, getErrorMessage, validateRequest } from "../utils/utils"
import { collections } from '../constants'


export const addAppointment = {
  v1: {
    endpoint: '/v1/appointment',
    validation: validateRequest(['vendorId'], ['firstName', 'lastName', 'email', 'phone', 'services']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']
        const services = req.body['services']!.map(({serviceId, providerId}: { serviceId: string, providerId: string}) => ({
          serviceId: new ObjectId(serviceId),
          providerId: new ObjectId(providerId)
        }))
        const bookings = await getCollection(collections.appointments)
        const result = await bookings.insertOne({ vendorId, ...req.body, services})
        console.log(result);
        res.send(result); 
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const cancelAppointment = {
  v1: {
    endpoint: '/v1/appointment',
    validation: validateRequest(['vendorId', 'id']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const serviceId = req.query['id']!
        const bookings = await getCollection(collections.appointments)
        console.log(serviceId)
        const result = await bookings.deleteOne({vendorId, _id: new ObjectId(serviceId.toString())})
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}