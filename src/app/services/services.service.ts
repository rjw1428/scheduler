import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WithID } from '../utils/utils';
import { TeamMember } from './teammember.service';

export type WithProviders<T> = T & {
  providers: WithID<TeamMember>[];
};

export type ServiceBase = {
  name: string;
  description: string;
  price: string;
};

export type ServiceWithProviders = WithProviders<WithID<ServiceBase>>;

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor(private http: HttpClient) {}

  getAllServices() {
    return this.http.get<WithID<ServiceBase>[]>(
      `${environment.apiUrl}/api/v1/services`
    );
  }

  addService(service: ServiceBase) {
    return this.http.post(`${environment.apiUrl}/api/v1/service`, service);
  }

  removeService(id: string) {
    return this.http.delete(`${environment.apiUrl}/api/v1/service`, {
      params: new HttpParams({
        fromObject: { id },
      }),
    });
  }

  getService(id: string) {
    return this.http.get<ServiceWithProviders>(
      `${environment.apiUrl}/api/v1/service`,
      {
        params: new HttpParams({
          fromObject: { id },
        }),
      }
    );
  }

  setProviders(serviceId: string, providers: string[]) {
    return this.http.post(`${environment.apiUrl}/api/v1/service-providers`, {
      id: serviceId,
      providers,
    });
  }

  getServicesForProvider(providerId: string) {
    return this.http.get<WithID<ServiceBase>[]>(
      `${environment.apiUrl}/api/v1/service-providers`,
      {
        params: new HttpParams({
          fromObject: { providerId },
        }),
      }
    );
  }

  addServicesToProvider(providerId: string, serviceIds: string[]) {
    return this.http.post(`${environment.apiUrl}/api/v1/team-member-services`, {
      id: providerId,
      serviceIds,
    });
  }
}
