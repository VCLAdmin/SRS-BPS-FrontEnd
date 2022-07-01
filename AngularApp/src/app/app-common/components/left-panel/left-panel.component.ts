import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { BpsProject } from '../../models/bps-project';
//import { } from 'googlemaps';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { CommonService } from '../../services/common.service';
import { Address } from '../../models/Address';
import { AppconstantsService } from '../../services/appconstants.service';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { addressStructure } from '../../data/addressStructure';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Output() updateListEvent: EventEmitter<null> = new EventEmitter();
  projectName = '';
  projectLocation = '';
  newProjectForm: FormGroup;
  dataVersionInformation: any;
  userEmail = '';
  //applicationType = 'BPS';
  dealerInfo: any;
  dealerCreditBalance: any;
  feature=Feature;
  constructor(private fb: FormBuilder, private homeService: HomeService,
    private appconstantsService: AppconstantsService,
    private router: Router, private configureService: ConfigureService,
    private navLayoutService: NavLayoutService, private commonService: CommonService, private permissionService: PermissionService) {
    this.newProjectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      projectLocation: ['', [Validators.required]],
    });
  }

  /**
   * Initialize the version inforlmation and the dealer information
   */
  ngOnInit(): void {
    this.userEmail = this.commonService.getUserEmail();
    //this.applicationType = this.commonService.getApplicationType();
    this.builderDetails();
    this.navLayoutService.GetVersionInformation().pipe(takeUntil(this.destroy$)).subscribe((versionInformation: any) => {
      if (versionInformation) {
        this.dataVersionInformation = versionInformation;
      }
    }, error => {
    });

    this.navLayoutService.resetUserInfoSubject.subscribe(bool => {
      if (bool) {
        this.builderDetails();
      }
    });
  }
  builderDetails() {
    this.dealerCreditBalance = 0;
    this.homeService.GetDealerInformation().pipe(takeUntil(this.destroy$)).subscribe(dealer => {
      this.dealerInfo = dealer;
      this.dealerCreditBalance = this.commonService.getDealerCreditBalance(dealer);
    });
  }
  onOpenContacts() {
    this.router.navigate(['contactlist']);
  }
  onOpenMigration() {
    this.router.navigate(['migration']);
  }
  onOpenHelpAndSupport() {
    this.router.navigate(['faqs'], { queryParams: {showBackButton: true } });
  }

  /**
   * Create a new project, save all the address details of the project location from the Google Map API and open the project
   */
  onCreate() {
    let newProject = new BpsProject();
    newProject.ProjectName = this.projectName;
    newProject.ProjectLocation = this.projectLocation;
    if (this.permissionService.checkPermission(Feature.CreateNewOrder) && this._address) {
      newProject.Line1 = this._address.Line1;
      newProject.Line2 = this._address.Line2;
      newProject.State = this._address.State;
      newProject.City = this._address.City;
      newProject.Country = this._address.Country;
      newProject.County = this._address.County;
      newProject.Longitude = this._address.Lng;
      newProject.Latitude = this._address.Lat;
      newProject.PostalCode = this._address.PostalCode;
    } else {
      newProject.Line1 = this.projectLocation;
    }
    //newProject.Problems = [];
    this.homeService.CreateProject(newProject).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      // const newFacadeLayout = {
      //   xPanelNo: 4,
      //   yPanelNo: 3,
      //   xInterval: 2000,
      //   yInterval: 2000
      // }; CreateDefaultProblemForFacadeProject
      this.homeService.CreateDefaultProblemForProject(response.ProjectGuid, this.commonService.getApplicationType()).pipe(takeUntil(this.destroy$)).subscribe((problem) => {
        if (response) {
          this.updateListEvent.emit();
          this.configureService.configureCall = false;
          this.configureService.setProblemShow(problem.ProblemGuid);
          this.configureService.sendMessage(false);
          this.configureService.newProblemBool = true;
          this.router.navigate(['/problemconfigure/', problem.ProblemGuid]);
        }
      });
    });
  }

  /**
   * Ban the '/' character in the project name
   */
  checkModelValidity() {
    if (this.projectName.includes('/')) {
      this.newProjectForm.controls['projectName'].setErrors({ 'incorrect': true });
    }
  }
  isProjectNameValid() {
    return this.newProjectForm.get('projectName')!.valid;
  }
  isProjectLocationValid() {
    return this.newProjectForm.get('projectLocation')!.valid;
  }
  // omit_special_char(event) {   
  //   var charCode;  
  //   charCode = event.charCode;   //  47 for '/' char
  //   if (charCode == 47) {
  //     this.newProjectForm.controls['projectName'].setErrors({'incorrect': true});
  //   }
  //   return true;
  //  }


  _address: Address;
  @ViewChild('addressText') addressText: any;
  autocomplete: google.maps.places.Autocomplete;
  /**
   * Add the Google Map API to the project location input
   */
  ngAfterViewInit() {
    //if (this.applicationType === 'SRS')
    {
      const self = this;
      const googleUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + this.appconstantsService.GOOGLE_API_KEY;
      if (!document.querySelectorAll(`[src="${googleUrl}"]`).length) {
        document.body.appendChild(Object.assign(
          document.createElement('script'), {
          type: 'text/javascript',
          src: googleUrl,
          onload: () => self.getPlaceAutocomplete()
        }));
      } else {
        self.getPlaceAutocomplete();
      }
      const addressSearch = document.getElementsByClassName('address-search-input');
      if (addressSearch.length > 0) {
        (addressSearch[0] as HTMLElement).focus();
      }
    }
  }

  /**
   * Populate the project location with the Google Map API suggestion
   */
  private getPlaceAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.addressText.nativeElement,
      {
        types: ['geocode', 'establishment']
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this._address = <Address>{};
      for (let i = 0; i < place.address_components!.length; i++) {
        const addressType = place.address_components![i].types[0];
        if ((addressStructure as any)[addressType]) {
          const val = (place.address_components![i] as any)[(addressStructure as any)[addressType]];
          if (val !== undefined) {
            if (addressType === 'sublocality_level_1') { this._address.Line2 = val; }
            else if (addressType === 'country') { this._address.Country = val; }
            else if (addressType === 'locality') { this._address.City = val; }
            else if (addressType === 'administrative_area_level_1') { this._address.State = val; }
            else if (addressType === 'administrative_area_level_2') { this._address.County = val; }
            else if (addressType === 'postal_code') { this._address.PostalCode = val; }
          }
        }
      }
      this._address.Lat = place.geometry.location.lat();
      this._address.Lng = place.geometry.location.lng();
      this._address.Line1 = place.name;
      this.projectLocation = place.formatted_address;
      this.isProjectLocationValid();
    });
  }

}
