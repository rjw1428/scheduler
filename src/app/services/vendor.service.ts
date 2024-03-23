import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AvailabilityRange = {
  start: number,
  end: number
}

export type DefaultSchedule = {
  mon: AvailabilityRange | null,
  tues: AvailabilityRange | null,
  wed: AvailabilityRange | null,
  thurs: AvailabilityRange | null,
  fri: AvailabilityRange | null,
  sat: AvailabilityRange | null,
  sun: AvailabilityRange | null
}

export type Vendor = {
  vendorId: string,
  name: string
  defaultSchedule: DefaultSchedule
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private http: HttpClient) { }

  getStoreData() {
    return this.http.get<Vendor>(`${environment.apiUrl}/api/v1/vendor`)
  }
}
