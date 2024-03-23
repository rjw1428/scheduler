import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, map, of, switchMap, take } from 'rxjs';
import { TeamMember } from './teammember.service';
import { WithID } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  constructor(private http: HttpClient) {}

  getAvailibilityByProvider(providerId: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/availability`, {
      params: new HttpParams({
        fromObject: { providerId },
      }),
    });
  }

  addTimeOff(providerId: string, startDate: Date, endDate: Date) {
    const start = startDate.toISOString()
    const end = endDate.toISOString()
    return this.http.post(
      `${environment.apiUrl}/api/v1/availability`,
      { start, end },
      {
        params: new HttpParams({
          fromObject: { providerId },
        }),
      }
    );
  }

  validateOffRequest(form: AbstractControl, selectedTeamMember: Observable<WithID<TeamMember>>): Observable<ValidationErrors | null> {
    if (form.invalid) {
      return of(null)
    }
    const start = new Date(form.get('start')?.value).toISOString()
    const end = new Date(form.get('end')?.value).toISOString()

    return selectedTeamMember.pipe(
      take(1),
      switchMap(teamMember => this.http.post<boolean>(`${environment.apiUrl}/api/v1/validate-availability`,
        { start, end },
        {
          params: new HttpParams({
            fromObject: { providerId: teamMember._id },
          }),
        })
      ),
      map(isAvailable => isAvailable ? null : { isAvailable })
    )
  }
}
