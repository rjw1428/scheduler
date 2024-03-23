import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { WithID } from '../utils/utils';

export type TeamMember = {
  firstName: string,
  lastName: string,
}

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {

  constructor(
    private http: HttpClient
  ) { }

  getTeamMembers() {
    return this.http.get<WithID<TeamMember>[]>(`${environment.apiUrl}/api/v1/team-members`)
  }

  addTeamMember(teamMember: TeamMember) {
    return this.http.post(`${environment.apiUrl}/api/v1/team-member`, { ...teamMember })
  }

  removeTeamMember(id: string) {
    return this.http.delete(`${environment.apiUrl}/api/v1/team-member`, { 
      params: new HttpParams({
        fromObject: { id }
      })
    })
  }
}
