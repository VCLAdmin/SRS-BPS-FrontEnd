import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BpsTableComponent, CeldType } from 'bps-components-lib';
import { timingSafeEqual } from 'crypto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { Contact } from '../../models/contact';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-contact-table',
  templateUrl: './contact-table.component.html',
  styleUrls: ['./contact-table.component.css']
})
export class ContactTableComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  contact: Contact;
  isOperating: any;
  configurationCustomGrid: any;
  listOfDisplayData = [];
  data = [];
  sortName: string | null = null;
  sortValue: string | null = null;
  searchValue = '';
  showEmpty = true;
  validateForm: FormGroup = new FormGroup({});
  validatePasswordForm: FormGroup = new FormGroup({});
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(private fb: FormBuilder, private navLayoutService: NavLayoutService, private homeService: HomeService) {
    this.validatePasswordForm = this.fb.group({
      Password: ['', Validators.minLength(8)],
      ConfirmPassword: ['', Validators.minLength(8)],
    }, {
      validator: this.ConfirmedValidator('Password', 'ConfirmPassword')
    });
    this.validateForm = this.fb.group({
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      UserName: ['', [Validators.required]],
      Email: [null, Validators.compose([Validators.required, Validators.maxLength(150)])],
      Language: ['', [Validators.required]],
      Company: ['', [Validators.required]],
      Active: [''],
      Role: ['']
    }, {
      validator: this.EmailExist('Email')
    });
  }
  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  EmailExist(controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      if (this.isAddContact && control.valid && control.value) {
        this.homeService.GetContacts().pipe(takeUntil(this.destroy$)).subscribe(bpsUsers => {          
          if (control.value && bpsUsers.filter(e => e.Email !== null && e.Email !== undefined && e.Email.toLowerCase() == control.value.toLowerCase()).length > 0) {
            control.setErrors({ emailExist: true });
          } else {
            control.setErrors(null);
          }
        });
        // } else {
        //   control.setErrors(null);
      }
    }
  }

  submitPasswordForm(value: any): void {
    // tslint:disable-next-line:forin
    for (const key in this.validatePasswordForm.controls) {
      this.validatePasswordForm.controls[key].markAsDirty();
      this.validatePasswordForm.controls[key].updateValueAndValidity();
    }
    if (this.validatePasswordForm.valid) {
      this.homeService.UpdateContact(this.contact).pipe(takeUntil(this.destroy$)).subscribe(bpsUser => {
      });
    }
  }
  submitForm(value: any): void {
    // tslint:disable-next-line:forin
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      if (this.isAddContact === true) {
        this.contact.Password = "Bps2019!";
        this.contact.ConfirmPassword = "Bps2019!";
        this.homeService.CreateContact(this.contact).pipe(takeUntil(this.destroy$)).subscribe(bpsUser => {
          this.formDataChanged = false;
          this.isAddContact = true;
          this.contact = {
            Id: 0, UserGuid: '',
            FirstName: '', UserName: '', LastName: '', Email: '',
            Language: 'en-US', Company: '', Password: '', ConfirmPassword: '',
            Active: false, Role: 'External',
          };
          this.loadData();
          this.validateForm.reset();
          this.showEmpty = true;
        });
      }
      else {
        this.homeService.UpdateContact(this.contact).pipe(takeUntil(this.destroy$)).subscribe(bpsUser => {
          this.formDataChanged = false;
          this.isAddContact = true;
          this.contact = {
            Id: 0, UserGuid: '',
            FirstName: '', UserName: '', LastName: '', Email: '',
            Language: 'en-US', Company: '', Password: '', ConfirmPassword: '',
            Active: false, Role: 'External',
          };
          this.loadData();
          this.validateForm.reset();
          this.showEmpty = true;
        });
      }
    }
  }

  formDataChanged = false;
  isAddContact = true;
  addContact(): void {
    this.contact = {
      Id: 0, UserGuid: '',
      FirstName: '', UserName: '', LastName: '', Email: '',
      Language: 'en-US', Company: '', Password: '', ConfirmPassword: '',
      Active: false, Role: '',
    }
    this.isAddContact = true;
    this.showEmpty = false;
  }
  deleteContact(): void {
    if (this.allowedToChange(this.contact.Email)) {
      this.homeService.canRemoveItem(this.contact.UserGuid).pipe(takeUntil(this.destroy$)).subscribe(returnVal => {
        if (returnVal == true) {
          this.homeService.removeItem(this.contact.UserGuid)
            .subscribe(data => {
              this.loadData();
              this.validateForm.reset();
              this.showEmpty = true;
            });
        } else {
          this.loadData();
          this.validateForm.reset();
          this.showEmpty = true;
        }
      }); 
    }
  }
  
  resetForm(e: MouseEvent): void {
    this.formDataChanged = false;
    e.preventDefault();
    if (this.isAddContact === true)
      this.validateForm.reset();
    else
      this.contact = this.listOfDisplayData.filter(f => f.Id === this.contact.Id)[0];
    // tslint:disable-next-line:forin
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

  /*------------------------------------------------------------------------*/
  checkModelValidity() {
  }
  ngOnInit(): void {
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(false);
    //isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
    this.navLayoutService.changeNavBarSettings(false,true,false)
    this.configurationCustomGrid = {
      fields: [
        // { celdType: CeldType.Default, display: 'First Name', property: 'FirstName', width: '500px', expandable: false, showSort: true },
        // { celdType: CeldType.Default, display: 'Last Name', property: 'LastName', width: '125px', showSort: true },
        { celdType: CeldType.Default, display: 'User Name', property: 'UserName', width: '125px', showSort: true },
        { celdType: CeldType.Default, display: 'Email', property: 'Email', width: '125px', showSort: true },
        { celdType: CeldType.Default, display: 'Language', property: 'Language', width: '125px', showSort: true },
        { celdType: CeldType.Default, display: 'Company', property: 'Company', width: '125px', showSort: true },
        //{ celdType: CeldType.Default, display: 'Password', property: 'Password', width: '125px', showSort: true }
      ],
      fieldId: 'Id'
    };

    this.loadData();
    this.formDataChanged = false;
    this.isOperating = true;
    this.listOfDisplayData = [
      ...this.data
    ];

    this.validateForm.valueChanges.subscribe(x => {
      this.formDataChanged = true;
    })
  }

  // deleteAllUsers(): void {
  //   this.data.forEach(element => {
  //     if (this.allowedToChange(element.Email)) {
  //       this.homeService.canRemoveItem(element.UserGuid).pipe(takeUntil(this.destroy$)).subscribe(returnVal => {
  //         if (returnVal == true) {
  //           this.homeService.removeItem(element.UserGuid)
  //             .subscribe(data => {
  //               // this.loadData();
  //               // this.validateForm.reset();
  //               // this.showEmpty = true;
  //             });
  //         } else {
  //           // this.loadData();
  //           // this.validateForm.reset();
  //           // this.showEmpty = true;
  //         }
  //       });
  //     }
  //   });
  // }
  allowedToChange(email: string): boolean { //move this to backend`
    var allowed = false;
    switch (email.toLowerCase()) {
      case "SRSAdministrator@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "Administrator@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "Internal@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "Designer@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "DigitalProposal@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "Acoustics@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      case "ProductConfigurator@vcldesign.com".toLowerCase():
        allowed = false;
        break;
      default:
        allowed = true;
      break;
    }
    return allowed;
  }
  loadData(): void {
    this.data = [];
    this.homeService.GetContacts().pipe(takeUntil(this.destroy$)).subscribe(bpsUsers => {
      bpsUsers.forEach(element => {
        if (element.Email) {
          this.data.push({
            expand: false,
            Id: element.Id,
            UserGuid: element.UserGuid,
            FirstName: element.FirstName,
            LastName: element.LastName,
            UserName: element.UserName,
            Email: element.Email,

            Language: element.Language,
            Company: element.Company,
            Password: null,

            ConfirmPassword: null,
            Active: true,
            Role: 'External'
          });
        }
      });

      setTimeout(() => {
        this.listOfDisplayData = [
          ...this.data
        ];
        this.isOperating = false;
        //this.deleteAllUsers();
      }, 2000);
    });
  }

  sort(sort: { sortName: string; sortValue: string }): void {
    this.sortName = sort.sortName;
    this.sortValue = sort.sortValue;
    this.search();
  }

  filter(value: string): void {
    this.searchValue = value;
    this.search();
  }

  search(): void {
    const filterFunc = (item: any) => {
      return item.UserName.indexOf(this.searchValue) !== -1;
    };

    const data = this.data.filter((item: {
      FirstName: string; LastName: string; UserName: string;
      Email: string; Language: string; Company: string; Password: string;
    }) => filterFunc(item));
    if (this.sortName && this.sortValue) {
      this.listOfDisplayData = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayData = [...this.listOfDisplayData];
    } else {
      this.listOfDisplayData = data;
    }
  }

  editRow(event: any): void {
    if (event.data) {
      this.isAddContact = false;
      this.formDataChanged = false;
      this.contact = {
        Id: event.data.Id, UserGuid: event.data.UserGuid,
        FirstName: event.data.FirstName, UserName: event.data.UserName, LastName: event.data.LastName, Email: event.data.Email,
        Language: event.data.Language, Company: event.data.Company, Password: '', ConfirmPassword: '',
        Active: true, Role: event.data.Role,
      }
      this.showEmpty = false;
    }
  }
}