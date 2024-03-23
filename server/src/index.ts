import express from 'express';
import cors from 'cors'
import { addTeamMember, getTeamMembers, removeTeamMember } from './handlers/teammembers.handlers';
import { getServices, getService, addService, removeService, addProviderToService, getServicesByProvider, addServicesToProvider } from './handlers/services.handlers';
import { addAppointment, cancelAppointment } from './handlers/appointments.handlers';
import { getAvailability, requestOff, validateOffRequest } from './handlers/availability.handlers';
import { getVendor } from './handlers/vendor.handlers';


const corsOptions = {
  origin: 'http://localhost:4200', // FOR DEVELOPMENT
}

export function app(): express.Express {
  const server = express();
  server.use(express.json());
  server.use(cors(corsOptions))

  // Team members
  server.get(`/api${getTeamMembers.v1.endpoint}`, getTeamMembers.v1.validation, getTeamMembers.v1.handler)
  server.post(`/api${addTeamMember.v1.endpoint}`, addTeamMember.v1.validation, addTeamMember.v1.handler);
  server.delete(`/api${removeTeamMember.v1.endpoint}`, removeTeamMember.v1.validation, removeTeamMember.v1.handler);

  // Services
  server.get(`/api${getServices.v1.endpoint}`, getServices.v1.validation, getServices.v1.handler)
  server.get(`/api${getService.v1.endpoint}`, getService.v1.validation, getService.v1.handler)
  server.post(`/api${addService.v1.endpoint}`, addService.v1.validation, addService.v1.handler)
  server.delete(`/api${removeService.v1.endpoint}`, removeService.v1.validation, removeService.v1.handler)
  server.get(`/api${getServicesByProvider.v1.endpoint}`, getServicesByProvider.v1.valiation, getServicesByProvider.v1.handler)
  server.post(`/api${addProviderToService.v1.endpoint}`, addProviderToService.v1.validation, addProviderToService.v1.handler)
  server.post(`/api${addServicesToProvider.v1.endpoint}`, addServicesToProvider.v1.validation, addServicesToProvider.v1.handler)

  // Availability
  server.post(`/api${requestOff.v1.endpoint}`, requestOff.v1.validation, requestOff.v1.handler)
  server.get(`/api${getAvailability.v1.endpoint}`, getAvailability.v1.validation, getAvailability.v1.handler)
  server.post(`/api${validateOffRequest.v1.endpoint}`, validateOffRequest.v1.validation, validateOffRequest.v1.handler)

  // Appointments
  server.post(`/api${addAppointment.v1.endpoint}`, addAppointment.v1.validation, addAppointment.v1.handler)
  server.delete(`/api${cancelAppointment.v1.endpoint}`, cancelAppointment.v1.validation, cancelAppointment.v1.handler)

  // Vendors
  server.get(`/api${getVendor.v1.endpoint}`, getVendor.v1.validation, getVendor.v1.handler)
  return server;
}

function run(): void {
  const port = process.env['PORT'] || 3000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
