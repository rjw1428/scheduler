import { Request, Response} from 'express';
import { getCollection, getErrorMessage, validateRequest } from '../utils/utils';
import { collections } from '../constants';
import { ObjectId } from 'mongodb';
import { initializeAvailability, removeAvailablity } from './availability.handlers';
import { removeProviderFromService } from './services.handlers';

export const getTeamMembers = {
  v1: {
    endpoint: '/v1/team-members',
    validation: validateRequest(['vendorId']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId'];
        const collection = await getCollection(collections.teamMembers);
        const result = await collection
          .find({ vendorId })
          .project({ vendorId: 0 })
          .toArray();
        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    },
  }
};

// WHEN A TEAM MEMBER IS ADDED, THE AVAILABLITY ENTRY NEEDS TO BE CREATED
export const addTeamMember = {
  v1: {
    endpoint: '/v1/team-member',
    validation: validateRequest(['vendorId'], ['firstName', 'lastName']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId'];
        const teammembers = await getCollection(collections.teamMembers);
        const result = await teammembers.insertOne({ ...req.body, vendorId });
  
        const vendor = await getCollection(collections.vendors);
        const vendorData = await vendor.findOne({ vendorId });
  
        // SAGA - IF VENDOR DATA FAILS, WE NEED TO UNDO AND THROW ERROR
        await initializeAvailability(result.insertedId, vendorData)

        console.log(result);
        res.send(result);
      } catch (err) {
        res.status(500).send(getErrorMessage(err));
      }
    },
  }
};

export const removeTeamMember = {
  v1: {
    endpoint: '/v1/team-member',
    validation: validateRequest(['vendorId', 'id']),
    handler: async (req: Request, res: Response) => {
      try {
        const vendorId = req.query['vendorId']!.toString()
        console.log(req.query['id'])
        const _id = new ObjectId(req.query['id']!.toString());
        const collection = await getCollection(collections.teamMembers);
        const result = await collection.deleteOne({ _id, vendorId });

        // SAGA: DELETE THEIR AVAILABILTY TOO
        await removeAvailablity(_id, vendorId)
        await removeProviderFromService(_id, vendorId)

        console.log(result);
        res.send(result);
      } catch (err) {
        console.log(err)
        res.status(500).send(getErrorMessage(err));
      }
    },
  }
};
