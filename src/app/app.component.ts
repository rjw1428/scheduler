import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TeamMember, TeamMemberService } from './services/teammember.service';
import { VendorService } from './services/vendor.service';
import { ServiceWithProviders, ServicesService } from './services/services.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject, Subject, catchError, combineLatest, distinctUntilChanged, filter, map, of, scan, shareReplay, startWith, switchMap, take, tap } from 'rxjs';
import { AvailabilityService } from './services/availability.service';
import { WithID } from './utils/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  refresh$ = new BehaviorSubject(null)
  serviceSelection$ = new Subject<string>()
  providerSelection$ = new Subject<string>()
  storeData$ = this.vendorService.getStoreData()
  teamMember$ = this.refresh$.pipe(
    switchMap(() => this.teamMemberService.getTeamMembers()),
    shareReplay(1)
  )
  services$ = this.refresh$.pipe(
    switchMap(() => this.servicesService.getAllServices()),
    shareReplay(1)
  )
  selectedService$ = this.serviceSelection$.pipe(
    filter(id => !!id.length),
    switchMap(id => this.refresh$.pipe(
      switchMap(() => this.servicesService.getService(id!)),
    )),
    shareReplay(1)
  )
  selectedProvider$ = this.selectedService$.pipe(
    switchMap(() => this.providerSelection$.pipe(
      switchMap(id => this.availabilityService.getAvailibilityByProvider(id))
    ))
  )
  selectedTeamMember$ = new ReplaySubject<WithID<TeamMember>>(1)
  selectedTeamMemberServices$ = this.selectedTeamMember$.pipe(
    switchMap(member => this.servicesService.getServicesForProvider(member._id)),
    shareReplay(1)
  )
  teamMemberForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required])
  })
  serviceForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    price: new FormControl('', [Validators.required, Validators.pattern(/(\.[0-9]{2}$)|(^[0-9]+$)/)]),
  })
  requestOffForm = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
    isFullDay: new FormControl(false)
  }, { 
    updateOn: 'change',
    asyncValidators: (form) => this.availabilityService.validateOffRequest(form, this.selectedTeamMember$)
  })

  resetUpdateProviders = new Subject()
  toggleProvider$ = new Subject<string>()
  selectedProviders$ = this.resetUpdateProviders.pipe(
    startWith(null),
    switchMap(() => this.selectedService$.pipe(
      switchMap(selectedService => {
        const startingSelection = selectedService.providers.map(provider => provider._id)
        return this.toggleProvider$.pipe(
          scan((acc, cur) => acc.includes(cur) 
            ? acc.filter(option => option !== cur) 
            : acc.concat(cur),
            startingSelection),
          startWith(startingSelection)
        )
      })
    ))
  )

  resetUpdateSerivces$ = new Subject()
  toggleService$ = new Subject<string>()
  selectedServices$ = this.resetUpdateSerivces$.pipe(
    startWith(null),
    switchMap(() => this.selectedTeamMemberServices$.pipe(
      switchMap(teamMemberServices => {
        const startingSelection = teamMemberServices.map(service => service._id)
        return this.toggleService$.pipe(
          scan((acc, cur) => acc.includes(cur) 
            ? acc.filter(option => option !== cur) 
            : acc.concat(cur),
            startingSelection),
          startWith(startingSelection)
        )
      })
    ))
   )

  constructor(
    private teamMemberService: TeamMemberService,
    private vendorService: VendorService,
    private servicesService: ServicesService,
    private availabilityService: AvailabilityService,
  ) { }

  addService(serviceForm: FormGroup, dialog: HTMLDialogElement) {
    if (!serviceForm.valid) return
    const newService = {...serviceForm.value, providers: [] }
    this.servicesService.addService(newService).subscribe(resp => {
      this.refresh$.next(null)
      dialog.close()
      serviceForm.reset()
    })
  }

  removeService(id: string) {
    this.servicesService.removeService(id).subscribe(resp => {
      this.refresh$.next(null)
    })
  }

  setProviders(updateIds: string[], selectedService: ServiceWithProviders, providersDialog: HTMLDialogElement) {
    this.servicesService.setProviders(selectedService._id, updateIds).subscribe(resp => {
      this.serviceSelection$.next(selectedService._id)
      this.resetUpdateProviders.next(null)
      providersDialog.close()
    })
  }

  addTeamMember(teamMemberForm: FormGroup, dialog: HTMLDialogElement) {
    if (!teamMemberForm.valid) return
    this.teamMemberService.addTeamMember(teamMemberForm.value).subscribe(resp => {
      this.refresh$.next(null)
      dialog.close()
      teamMemberForm.reset()
    })
  }

  removeTeamMember(id: string) {
    this.teamMemberService.removeTeamMember(id).subscribe(resp => {
      this.refresh$.next(null)
    })
  }

  addServiceToTeamMember(updateIds: string[], selectedTeamMember: WithID<TeamMember>, dialog: HTMLDialogElement) {
    this.servicesService.addServicesToProvider(selectedTeamMember._id, updateIds).subscribe(resp => {
      this.refresh$.next(null)
      console.log(updateIds)
      dialog.close()
    })
  }

  // BOOK APPOINTMENT
  // SHOW CALENDAR
  teamMemberOffRequest(id: string, requestForm: FormGroup, dialog: HTMLDialogElement) {
    console.log(id)
    console.log(requestForm.value)
    if (!requestForm.valid) {
      console.log(requestForm.errors)
      return
    }
    const start = new Date(requestForm.get('start')?.value)
    const end = new Date(requestForm.get('end')?.value)
    this.availabilityService.addTimeOff(id, start, end).subscribe(resp => {
      requestForm.reset()
      dialog.close()
    })
  }
}
