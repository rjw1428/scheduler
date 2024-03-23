import { Request, Response} from 'express'
import { getCollection, getErrorMessage, validateRequest } from "../utils/utils";
import { collections } from '../constants';
import { ObjectId } from 'mongodb';


export const getServices = {
  v1: {
    endpoint: '/v1/services',
    validation: validateRequest(['vendorId']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const collection = await getCollection(collections.services)
        const result = await collection
          .find({vendorId})
          .project({name: 1, price: 1, description: 1 })
          .toArray()
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const getService = {
  v1: {
    endpoint: '/v1/service',
    validation: validateRequest(['vendorId', 'id']),
    handler: async (req: Request, res: Response) => {
      try {
        const serviceId =  req.query['id']!
        const collection = await getCollection(collections.services)
        const result = await collection
          .aggregate([
            { $match: { _id: new ObjectId(serviceId.toString()) } },
            { $lookup: { 
              from: collections.teamMembers, 
              localField: 'providers.id', 
              foreignField: '_id', 
              as: 'providers' 
            } },
          ])
          .project({ vendorId: 0})
          .tryNext()
        console.log(result);
        res.send(result);
      } catch (err) {
        console.log(err)
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const addService = {
  v1: {
    endpoint: '/v1/service',
    validation: validateRequest(['vendorId'], ['providers', 'name', 'price', 'description']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const providerIds = req.body['providers']!
        const providers = providerIds.map((id: string) => ({ id: new ObjectId(id) }))
        const collection = await getCollection(collections.services)
        const result = await collection.insertOne({vendorId, ...req.body, providers})
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const removeService = {
  v1: {
    endpoint: '/v1/service',
    validation: validateRequest(['vendorId', 'id']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const _id = new ObjectId(req.query['id']!.toString())
        const collection = await getCollection(collections.services)
        const result = await collection.deleteOne({ vendorId, _id })
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const addProviderToService = {
  v1: {
    endpoint: '/v1/service-providers',
    validation: validateRequest(['vendorId'], ['id', 'providers']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const _id = new ObjectId(req.body['id']!.toString())
        const providerIds = req.body['providers']! as string[]

        const collection = await getCollection(collections.services)
        const result = await collection.updateOne(
          { vendorId, _id },
          { $set: { providers: providerIds.map(id => ({ id: new ObjectId(id) })) } }
        )
        res.send(result)
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const removeProviderFromService = async (providerId: ObjectId, vendorId: string) => {
  const collection = await getCollection(collections.services)
  const result = await collection.updateMany(
    { vendorId },
    // @ts-ignore
    { $pull: { 'provider': { id: providerId } }}
  )
  console.log(result)
}

export const getServicesByProvider = {
  v1: {
    endpoint: '/v1/service-providers',
    valiation: validateRequest(['vendorId', 'providerId']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!
        const providerId = new ObjectId(req.query['providerId']!.toString())
        const collection = await getCollection(collections.services)
        const result = await collection
          .find({ vendorId, providers: { $elemMatch: { id: providerId }}})
          .project({name: 1 })
          .toArray()

        console.log(result)
        res.send(result)
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    }
  }
}

export const addServicesToProvider = {
  v1: {
    endpoint: '/v1/team-member-services',
    validation: validateRequest(['vendorId'], ['id', 'serviceIds']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!.toString()
        const _id = new ObjectId(req.body['id']!.toString());
        const serviceIds = req.body['serviceIds']! as string[]
        const collection = await getCollection(collections.services)
        const allSerivces = await collection.find({vendorId}).toArray()
        
        const docsToRemoveUser = allSerivces
          .filter(docs => !serviceIds.includes(docs._id.toString()))
          .map(docs => docs._id)

        const result = await Promise.all([
          collection.updateMany(
            { vendorId, _id: { $in: serviceIds.map(id => new ObjectId(id)) }},
            // @ts-ignore
            { $addToSet: { providers: {id: _id } }}
          ),
          collection.updateMany(
            { vendorId, _id: { $in: docsToRemoveUser }},
            // @ts-ignore
            { $pull: { providers: {id: _id } }}
          )
        ])

        console.log(result);
        res.send(result);
      } catch (err) {
        console.log(err)
        res.status(500).send(getErrorMessage(err));
      }
    },
  }
};