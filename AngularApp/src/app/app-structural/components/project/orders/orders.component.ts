import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BpsUnifiedModel, Section } from 'src/app/app-common/models/bps-unified-model';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { NzModalService, NzTableComponent } from 'ng-zorro-antd';
import { HomeService } from 'src/app/app-common/services/home.service';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { CommonService } from 'src/app/app-common/services/common.service';
import { Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OrderApiModel, OrderDetailsApiModel, OrderModel, ShippingAddressModel, StoreAddressModel } from 'src/app/app-structural/models/order-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { DealerModel } from 'src/app/app-structural/models/dealer-model';
import { Router } from '@angular/router';
import { DownloadService } from 'src/app/app-layout/services/download.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationCustomComponent } from '../notification/notification-custom/notification-custom.component';
import { addressStructure } from 'src/app/app-common/data/addressStructure';
import { Address } from 'src/app/app-common/models/Address';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { Feature } from 'src/app/app-core/models/feature';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import * as FileSaver from 'file-saver';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, AfterViewInit {
  @ViewChild(NotificationCustomComponent) notifCustomTemplate: NotificationCustomComponent;
  feature = Feature;

  ngNotificaionShow(event: any) {
    this.notifCustomTemplate.notificationShow(event.title, event.message, event.logoToShow);
  }
  @HostListener('document:click')
  clickout() {
    //this.notifCustomTemplate.notificationRemove();
  }

  shipping_zipcode = '';
  private destroy$ = new Subject();
  orderModel = new OrderModel();
  osPicker = "0";
  osPickerValue = 0;
  loading = true;
  currentOrderNumber = "";
  shippingAddressForm: FormGroup = new FormGroup({});
  dealerInfo: DealerModel;
  dealerCreditBalance: any;
  language: string;
  isShippingButtonInvalid: boolean = false;
  isPinCodeValid: boolean;
  Location: string = '';
  imagesList: any = [];
 // lastPincodeAPICalls_id: number = 0;
 // waitForPostalCodeCheckAPI: boolean = false;

 @ViewChild('tplLowBalance') tplLowBalance: TemplateRef<{}>
 @ViewChild('tplCancelAll') tplCancelAll: TemplateRef<{}>
 @ViewChild('tplCancel') tplCancel: TemplateRef<{}>


  constructor(private fb: FormBuilder, private appConstantService: AppconstantsService,
    private router: Router, private downloads: DownloadService, private sanitizer: DomSanitizer,
    private translate: TranslateService, private modalService: NzModalService, private homeService: HomeService,
    private configureService: ConfigureService, private commonService: CommonService, private navLayoutService: NavLayoutService,
    private permissionService: PermissionService, private umService: UnifiedModelService) {
  }
  operabilitySystemsPickerChange(event: any) {
    this.osPickerValue = parseInt(event);
  }
  ngOnInit(): void {
    this.language = this.configureService.getLanguage()
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
    this.navLayoutService.changeNavBarSettings(false, true, true)
    this.loading = true;
    this.UpdateDealerInfo();

    this.configureService.GetProblemByGuid(this.navLayoutService.getRouteParam('problemGuid'));

    this.orderModel.hasFullAccess = this.commonService.getUserRole() === "Dealer-Full" ? true : false;
    this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe(problem => {
      let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
      this.orderModel.current_ProjectGuid = unifiedModel.ProblemSetting.ProjectGuid;
      this.orderModel.current_ProjectId = problem.ProjectId;
      this.orderModel.current_ProblemGuid = problem.ProblemGuid;
      this.loadDataProblems(this.orderModel.current_ProjectGuid);
    });

    this.shippingAddressForm = this.fb.group({
      // Email: [{value:'', disabled: this.orderModel.orderPlaced}, [Validators.email, Validators.required]],
      Email: ['', [Validators.email, Validators.required]],
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      PhoneNumber: ['', [Validators.required, Validators.minLength(10)]],
      Email2: [''],
      Address: ['', [Validators.required]],
      Apartment: [''],
      PostalCode: ['', [Validators.required]],
      City: ['', [Validators.required]],
      State: ['', [Validators.required]]
    }, {
      validator: this.checkIsValidPincode('PostalCode')
    });

    this.navLayoutService.resetUserInfoSubject.subscribe(bool => {
      if (bool) {
        this.UpdateDealerInfo();
      }
    });
  }

  buildShippingAddressForm(address: ShippingAddressModel){
    this.shippingAddressForm = this.fb.group({
      // Email: [{value:'', disabled: this.orderModel.orderPlaced}, [Validators.email, Validators.required]],
      Email: [address.Email, [Validators.email, Validators.required]],
      FirstName: [address.FirstName, [Validators.required]],
      LastName: [address.LastName, [Validators.required]],
      PhoneNumber: [address.PhoneNumber, [Validators.required, Validators.minLength(10)]],
      Email2: [address.Email2],
      Address: [address.Address, [Validators.required]],
      Apartment: [address.Apartment],
      PostalCode: [address.PostalCode, [Validators.required]],
      City: [address.City, [Validators.required]],
      State: [address.State, [Validators.required]]
    }, {
      validator: this.checkIsValidPincode('PostalCode')
    });
    this.orderModel.allOrders.Line1 = address.Address;
    this.orderModel.allOrders.Line2 = address.Apartment;
    this.orderModel.allOrders.State = address.State;
    this.orderModel.allOrders.City = address.City;
    this.orderModel.allOrders.PostalCode = address.PostalCode;
    this.orderModel.allOrders.AdditionalDetails = "";
    this.onAddressChange();
  }
  /* -- Dealer Info --------------------------------------------------------------- */
  /* ---------------------------------------------------------------------------------- */
  UpdateDealerInfo() {
    this.dealerCreditBalance = 0;
    this.homeService.GetDealerInformation().pipe(takeUntil(this.destroy$)).subscribe(dealer => {
      this.dealerInfo = dealer;
      setTimeout(() => {
        this.dealerCreditBalance = this.commonService.getDealerCreditBalance(dealer);
      }, 10);
    });
  }
  /* -- Product List --------------------------------------------------------------- */
  /* ---------------------------------------------------------------------------------- */

  scrollToElement(value: string): void {
    // const element = document.querySelector("#id" + value)
    // if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: "nearest" })
  }
  trackByIndex(_: number, data: any): number {
    return data.index;
  }
  ngAfterViewInit(): void {
    if (!this.loading) {
      // setTimeout(() => {
      //   if (this.nzTableComponent) {
      //     this.nzTableComponent.cdkVirtualScrollViewport.scrolledIndexChange
      //       .pipe(takeUntil(this.destroy$))
      //       .subscribe((data: number) => {
      //         
      //       });
      //   }
      // }, 100);
    }
  }
  ngOnDestroy(): void {
   // this.configureService.orderModel_shipping_Address = {...this.orderModel.shipping_Address};
    this.configureService.orderModel_show_ShipToAddress = this.orderModel.show_ShipToAddress;
    this.notifCustomTemplate.notificationRemove();
    this.destroy$.next();
    this.destroy$.complete();
  }

  didCheckout: boolean = false;
  loadDataProblems(projectGuid: any): void {    
    this.loading = true;
    this.configureService.GetProjectOrders(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe((resOrdersList) => {
      if (resOrdersList.OrderId === 0) {
        this.orderModel.orderPlaced = false;
      }
      else {
        this.orderModel.orderPlaced = true;
      }
      this.configureService.GetProblemsForProject(projectGuid).pipe(takeUntil(this.destroy$)).subscribe((resProblemsList) => {
        this.orderModel.data_AllOrders = [];
        this.orderModel.allProducts = resProblemsList;
        let scrollToIndex = 1;
        this.currentOrderNumber = "";
        let i = 1;

        this.orderModel.allOrders = resOrdersList;
        this.orderModel.allProducts.forEach(product => {
          var check = [];
          if (resOrdersList.OrderId == 0 || resOrdersList.OrderDetails == null) { }
          else if (resOrdersList.OrderDetails.length > 0) {
            check = resOrdersList.OrderDetails.filter(f => f.ProductId == product.ProblemId);
          } else if (resOrdersList.SubOrder.length > 0) {
            check = resOrdersList.SubOrder.filter(f => f.OrderDetails[0].ProductId == product.ProblemId);
          }
          let unifiedModel = JSON.parse(product.UnifiedModel);
          this.umService.setUnifiedModel(unifiedModel);
          if (unifiedModel.ModelInput.FrameSystem.SystemType === 'AWS 75.SI+') {
            if (unifiedModel.ModelInput.Geometry.OperabilitySystems && unifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
              unifiedModel.ModelInput.Geometry.OperabilitySystems.forEach((element, index) => {
                if (element.InsideHandleArtcileName !== null && element.InsideHandleArtcileName !== '') {
                  element.InsideHandleArticleDescription = this.umService.get_InsideHandle(index);
                }
              });
            }
          } else if (unifiedModel.ModelInput.FrameSystem.SystemType === 'ADS 75') {
            if (unifiedModel.ModelInput.Geometry.DoorSystems && unifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
              unifiedModel.ModelInput.Geometry.DoorSystems.forEach((element, index) => {
                if (element.InsideHandleArtcileName !== null && element.InsideHandleArtcileName !== '') {
                  element.InsideHandleArticleDescription = this.umService.get_InsideHandle(index);
                }
              });
            }
          }
          else {
            if (unifiedModel.ModelInput.FrameSystem.SystemType === 'ASE 60') {
              if (unifiedModel.ModelInput.Geometry.SlidingDoorSystems && unifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
                unifiedModel.ModelInput.Geometry.SlidingDoorSystems.forEach(element => {
                  if (element.InsideHandleArtcileName !== null && element.InsideHandleArtcileName !== '') {
                    element.InsideHandleArticleDescription = this.umService.get_InsideHandleForSlidingDoors();
                  }
                });
              }
            }
          }
          
          if (unifiedModel.AnalysisResult && (resOrdersList.OrderId == 0 || resOrdersList.OrderDetails == null || check.length > 0)) {           
            this.didCheckout = true;
            let dimensions = this.readProductInfoData(unifiedModel);

            if (product.ProblemGuid === this.orderModel.current_ProblemGuid) {
              scrollToIndex = this.orderModel.allProducts.findIndex(f => f.ProblemId == product.ProblemId);

              var scrollTovalue = this.orderModel.allProducts.filter(f => f.ProblemId == product.ProblemId)[0];
              this.currentOrderNumber = scrollTovalue.ProjectId + '' + scrollTovalue.ProblemId;
            }
            let Status = '';
            let Process = '';
            let ModifiedOn;
            let OrderDetails;
            let OrderStatus;

            if (this.orderModel.orderPlaced) {
              if (this.orderModel.allOrders.SubOrder.length > 0) {
                let subOrder = this.orderModel.allOrders.SubOrder.filter(f => f.OrderDetails[0].ProductId === product.ProblemId)[0];
                OrderDetails = subOrder.OrderDetails;
                OrderStatus = subOrder.OrderStatus;
                Status = subOrder.Current_Status;
                Process = subOrder.Current_Process;
                ModifiedOn = subOrder.ModifiedOn;
              } else {
                let allOrders = this.orderModel.allOrders;
                OrderDetails = this.orderModel.allOrders.OrderDetails;
                OrderStatus = this.orderModel.allOrders.OrderStatus;
                Status = allOrders.Current_Status;
                Process = allOrders.Current_Process;
                ModifiedOn = allOrders.ModifiedOn;
              }
            }
            var subTotal = 0;
            var quantity = "1";
            if (unifiedModel.SRSProblemSetting) {
              quantity = unifiedModel.SRSProblemSetting.Quantity > 0 ? "" + unifiedModel.SRSProblemSetting.Quantity : "1";
              subTotal = unifiedModel.SRSProblemSetting.SubTotal;
            }
            this.orderModel.data_AllOrders.push({
              index: i,
              id: '' + i,

              configuration: product.ProblemName,
              disabled: false,
              problemGuid: product.ProblemGuid,
              productId: product.ProblemId,
              projectId: product.ProjectId,
              problem: product,
              unifiedModel: unifiedModel,

              modifiedOn: ModifiedOn,
              // Quantity: "1",
              // Price: 500,
              // Total: 1 * 500,
              Status: Status,
              Process: Process,
              Quantity: quantity,
              Price: subTotal,
              Total: parseInt(quantity) * subTotal,
              OrderDetails: OrderDetails,
              OrderStatus: OrderStatus,
              ImagePath: '',

              PRODUCT: product.ProblemName,
              ORDERNUMBER: 'Order Number ' + product.ProjectId + '-' + product.ProblemId,
              PRODUCTTYPE: unifiedModel.ProblemSetting.ProductType,
              DIMENSION: dimensions, //product_Dimensions
              SYSTEM: unifiedModel.ModelInput.FrameSystem.SystemType, //product_SystemType
            });
            i++;

          }
        });

        this.orderModel.data_AllOrders.sort(function (a, b) { return a.productId - b.productId });

        if(this.imagesList.length > 0) {
          this.orderModel.data_AllOrders.forEach((ele) => {
            this.imagesList.forEach((img) => {
              if(ele.productId === img.productId) {
                ele.ImagePath = img.imageURL;
              }
            });
          });
        } else {
          this.buildProductImage();
        } 
        
        this.buildAddress();
        
      });
    });
  }
  buildProductImage() {
    this.orderModel.data_AllOrders.forEach(product => {
      this.configureService.GetScreenshotURL(product.problem.ProblemGuid).subscribe(imageURL => {
        this.imagesList.push({'productId': product.productId, 'imageURL': imageURL});
        product.ImagePath = imageURL;
      }, (error) => { });
    });
  }
  buildAddress() {    
    this.orderModel.shipping_Address = new ShippingAddressModel();
    this.orderModel.store_Address = new StoreAddressModel();
    this.orderModel.store_Address.Address = this.dealerInfo.Line1 + ', ' + this.dealerInfo.Line2 + ', ' + this.dealerInfo.City + ', ' + this.dealerInfo.State + ' - ' + this.dealerInfo.PostalCode;
    this.orderModel.store_Address.Email = this.dealerInfo.PrimaryContactEmail;
    this.orderModel.store_Address.PhoneNumber = this.dealerInfo.PrimaryContactPhone;
    if (this.orderModel.allOrders.AddressType !== null) {
      this.orderModel.show_ShipToAddress = this.orderModel.allOrders.AddressType;
      this.orderModel.shipping_Address.Address = this.orderModel.allOrders.Line1;
      this.orderModel.shipping_Address.Apartment = this.orderModel.allOrders.Line2;
      this.orderModel.shipping_Address.City = this.orderModel.allOrders.City;
      this.orderModel.shipping_Address.State = this.orderModel.allOrders.State;
      this.orderModel.shipping_Address.PostalCode = this.orderModel.allOrders.PostalCode;
      this.shipping_zipcode = this.orderModel.shipping_Address.PostalCode;
      this.orderModel.shipping_Address.Lat = this.orderModel.allOrders.Latitude;
      this.orderModel.shipping_Address.Lng = this.orderModel.allOrders.Longitude;

      if (this.orderModel.allOrders.AdditionalDetails) {
        this.orderModel.shipping_Address.Email = this.orderModel.allOrders.AdditionalDetails.split("/")[0];
        this.orderModel.shipping_Address.Email2 = this.orderModel.allOrders.AdditionalDetails.split("/")[1];
        this.orderModel.shipping_Address.FirstName = this.orderModel.allOrders.AdditionalDetails.split("/")[2];
        this.orderModel.shipping_Address.LastName = this.orderModel.allOrders.AdditionalDetails.split("/")[3];
        this.orderModel.shipping_Address.PhoneNumber = this.orderModel.allOrders.AdditionalDetails.split("/")[4];
      }
      this.buildOrderSummary();
      this.buildSA();
    } else {
      this.homeService.GetProjectByGuid(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe(_response => {
        this.orderModel.shipping_Address.Address = _response.Line1.trim() == "." ? "" : _response.Line1.trim();
        this.orderModel.shipping_Address.Apartment = _response.Line2 == null || _response.Line2.trim() == "." ? "" : _response.Line2.trim();
        this.orderModel.shipping_Address.City = _response.City.trim() == "." ? _response.Line2 == null || _response.Line2.trim() == "." ? "" : _response.Line2.trim() : _response.City.trim();
        this.orderModel.shipping_Address.State = _response.State == null || _response.State.trim() == "." ? "" : _response.State.trim();
        this.orderModel.shipping_Address.PostalCode = _response.PostalCode == null || _response.PostalCode.trim() == "." ? "" : _response.PostalCode.trim();
        this.shipping_zipcode = this.orderModel.shipping_Address.PostalCode;
        this.orderModel.shipping_Address.Lat = _response.Latitude;
        this.orderModel.shipping_Address.Lng = _response.Longitude;
        this.buildOrderSummary();
        this.buildSA();
      });
    }    
  }

  buildSA() {
    setTimeout(() => {
      if (this.orderModel.orderPlaced) {
        this.orderModel.valid_ShipToAddress = true;
        this.orderModel.show_Disclaimer = false;
        this.orderModel.allow_ToPlaceOrder = true;
        this.orderModel.orderPlacedOn = this.orderModel.allOrders.CreatedOn;
        this.orderModel.type_ShippingMethod = this.orderModel.allOrders.ShippingMethod ? 'STL' : 'TL';
        if (this.calculateDiff(this.orderModel.orderPlacedOn) > 1)
          this.orderModel.show_CancelOrder = false;
      }
      else {
        if (localStorage.getItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails')) {
         // console.log(localStorage.getItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails'));
          let ShippingOrderAdditionalDetails: string;
          ShippingOrderAdditionalDetails = localStorage.getItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails')
          this.orderModel.shipping_Address.Email = ShippingOrderAdditionalDetails.split("/")[0];
          this.orderModel.shipping_Address.Email2 = ShippingOrderAdditionalDetails.split("/")[1];
          this.orderModel.shipping_Address.FirstName = ShippingOrderAdditionalDetails.split("/")[2];
          this.orderModel.shipping_Address.LastName = ShippingOrderAdditionalDetails.split("/")[3];
          this.orderModel.shipping_Address.PhoneNumber = ShippingOrderAdditionalDetails.split("/")[4];
        }
        if (this.configureService.orderModel_show_ShipToAddress != undefined) {
          this.orderModel.show_ShipToAddress = this.configureService.orderModel_show_ShipToAddress;
          this.configureService.orderModel_show_ShipToAddress = undefined;
        }
        if (this.configureService.orderModel_shipping_Address != undefined) {
          this.orderModel.shipping_Address = {...this.configureService.orderModel_shipping_Address};              
          this.shipping_zipcode = this.orderModel.shipping_Address.PostalCode;
          if(this.shipping_zipcode === ""){
            this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
            this.errorInvalidPostalCode();
          } 
          else {
           // this.isShippingButtonInvalid = false;
            // this.orderModel.valid_ShipToAddress = true;
            this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
          }
          // this.configureService.orderModel_shipping_Address = undefined;
          if(this.shipping_zipcode !== "") {
            this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
            this.homeService.GetStateTax(this.shipping_zipcode).pipe(takeUntil(this.destroy$)).subscribe(state => {   
              if (state === null) {
                this.clearPrices();
                 this.errorInvalidPostalCode();
              } else {
                this.buildOrderSummary();
              }
            });    
          }  
        }
        else {
          if (this.shipping_zipcode == "" && this.orderModel.shipping_Address.PostalCode == "") {
            
            this.buildShippingAddressForm(this.orderModel.shipping_Address);
              this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
              this.clearPrices();
              this.errorInvalidPostalCode();
          }
          else {
            this.homeService.GetStateTax(this.shipping_zipcode).pipe(takeUntil(this.destroy$)).subscribe(state => {    
              if (state === null) {
                this.clearPrices();
                this.errorInvalidPostalCode();
              } else {
                this.buildShippingAddressForm(this.orderModel.shipping_Address)  ;
               // this.orderModel.valid_ShipToAddress = true;
               this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
               if(this.shippingAddressForm.valid) {
                this.orderModel.valid_ShipToAddress = true; 
               } else {
                this.orderModel.valid_ShipToAddress = false;
               }
               // this.orderModel.valid_ShipToAddress = true;                
                this.buildOrderSummary();
              }
            });  
          }
        }
      }
      this.loading = false;
      setTimeout(() => {
        this.scrollToElement(this.currentOrderNumber);
      }, 1000);
    }, 100);
  }
  clearPrices() {
    this.orderModel.amount_Subtotal = 0;
    this.orderModel.amount_Shipping = 0;
    this.orderModel.amount_TotalBeforeTax = 0;
    this.orderModel.amount_EstimatedTax = 0;
    this.orderModel.amount_Total = 0;
  }

  checkIsValidPincode(controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      if (control.valid && control.value) {
       // this.waitForPostalCodeCheckAPI = true;
      //  this.lastPincodeAPICalls_id += 1;
      //  let currentAPICALL_id = this.lastPincodeAPICalls_id;
        this.homeService.GetStateTax(control.value).pipe(takeUntil(this.destroy$)).subscribe(state => {
         // if (currentAPICALL_id == this.lastPincodeAPICalls_id) {         
            if (control.value && state === null) {
              control.setErrors({ inValidPinCode: true });
              this.isPinCodeValid = false;
              this.shipping_zipcode = "";
              this.clearPrices();
             // this.waitForPostalCodeCheckAPI = false;
            } else {
              control.setErrors(null);
              this.isPinCodeValid = true;
              this.showErrorInvalidPostalCode = false;
              this.notifCustomTemplate.notificationRemove();
             // this.waitForPostalCodeCheckAPI = false;
            }
         // }
        });     
      }
    }
  }

  // onShipToAddressChange(event: string) {
  //   this.orderModel.show_ShipToAddress = event;
  //   this.addressValid();
  // }
  // addressValid() {
  //   if (this.orderModel.show_ShipToAddress === 'ADDRESS') {
  //     if (this.orderModel.shipping_Address.Address.trim() === "" ||
  //       this.orderModel.shipping_Address.City.trim() === "" || this.orderModel.shipping_Address.State.trim() === "" ||
  //       this.orderModel.shipping_Address.PostalCode.trim() === "" || this.orderModel.shipping_Address.Email.trim() === "" ||
  //       this.orderModel.shipping_Address.FirstName.trim() === "" || this.orderModel.shipping_Address.LastName.trim() === "" ||
  //       this.orderModel.shipping_Address.PhoneNumber.trim() === "") {
  //       this.orderModel.valid_ShipToAddress = false;
  //     }
  //   }
  //   else
  //     this.orderModel.valid_ShipToAddress = true;
  // }

  onAddressChange() {
    setTimeout(() => {
      if (this.orderModel.show_ShipToAddress === 'ADDRESS')
        for (const key in this.shippingAddressForm.controls) {
          this.shippingAddressForm.controls[key].markAsDirty();
          this.shippingAddressForm.controls[key].updateValueAndValidity();
        }
    }, 1000);
  }
  calculateDiff(sentDate: Date) {
    var date1: any = new Date(sentDate);
    var date2: any = new Date();
    var diffDays: any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  // orderNumber(): string {
  //   let now = Date.now().toString() // '1492341545873'
  //   // pad with extra random digit
  //   now += now + Math.floor(Math.random() * 10)
  //   // format
  //   return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-')
  // }

  /* -- 2. Order Summary --------------------------------------------------------------- */
  /* ----------------------------------------------------------------------------------- */
  is_buildOrderSummary_running: boolean = false;  //cannot run buildOrderSummary many times at the same time
  buildOrderSummary() {
    if (!this.is_buildOrderSummary_running) {
      this.is_buildOrderSummary_running = true;
      this.getPlaceAutocomplete();
      let postal_code = "10018";
      let state = "";
      if (this.shipping_zipcode != "") {
        this.homeService.GetStateTax(this.shipping_zipcode).pipe(takeUntil(this.destroy$)).subscribe(stateTax => {
          this.orderModel.amount_Subtotal = 0;
          if (stateTax) {
            this.orderModel.allOrders.TaxRate = stateTax.EstimatedCombinedRate;
            state = stateTax.State;
          }
          else {
            this.orderModel.allOrders.TaxRate = 0;
          }

          let taxRate = this.orderModel.allOrders.TaxRate ? this.orderModel.allOrders.TaxRate : 0;
          let shippingCost = this.calculateShippingCost(state);
          this.orderModel.amount_EstimatedTax = this.orderModel.amount_TotalBeforeTax * taxRate;
          // this.orderModel.amount_EstimatedTax1 = this.orderModel.amount_TotalBeforeTax1 * taxRate;
          // this.orderModel.amount_EstimatedTax2 = this.orderModel.amount_TotalBeforeTax2 * taxRate;

        if (this.orderModel.data_AllOrders.length > 0) {
          this.orderModel.data_AllOrders.forEach(element => {
            if(stateTax !== null)
            this.orderModel.amount_Subtotal += parseInt(element.Quantity) * element.Price;
            else
            this.orderModel.amount_Subtotal = 0;
          });
          this.orderModel.amount_Shipping = shippingCost == 0 ? stateTax === null ? 0 : 8000 : shippingCost;
          // this.orderModel.amount_Shipping1 = 6000;
          // this.orderModel.amount_Shipping2 = 10000;
          this.orderModel.amount_TotalBeforeTax = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping;
          // this.orderModel.amount_TotalBeforeTax1 = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping1;
          // this.orderModel.amount_TotalBeforeTax2 = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping2;
          let taxRate = this.orderModel.allOrders.TaxRate ? this.orderModel.allOrders.TaxRate : 0;
          this.orderModel.amount_EstimatedTax = this.orderModel.amount_TotalBeforeTax * taxRate;
          // this.orderModel.amount_EstimatedTax1 = this.orderModel.amount_TotalBeforeTax1 * taxRate;
          // this.orderModel.amount_EstimatedTax2 = this.orderModel.amount_TotalBeforeTax2 * taxRate;
          this.orderModel.amount_SchucoPartnerDiscount = 0; //200

            this.orderModel.amount_Total = this.orderModel.amount_TotalBeforeTax + this.orderModel.amount_EstimatedTax - this.orderModel.amount_SchucoPartnerDiscount;
            if (this.orderModel.minAmount_PerOrder > this.orderModel.amount_Total) {
              this.errorMinAmountPerOrder();
            }
            // this.orderModel.amount_Total1 = this.orderModel.amount_TotalBeforeTax1 + this.orderModel.amount_EstimatedTax1 - this.orderModel.amount_SchucoPartnerDiscount;
            // this.orderModel.amount_Total2 = this.orderModel.amount_TotalBeforeTax2 + this.orderModel.amount_EstimatedTax2 - this.orderModel.amount_SchucoPartnerDiscount;
          } else {
            if(stateTax !== null) {
              this.orderModel.amount_Shipping = 8000;
              // this.orderModel.amount_Shipping1 = 6000;
              // this.orderModel.amount_Shipping2 = 10000;
              
              // this.orderModel.amount_TotalBeforeTax1 = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping1;
              // this.orderModel.amount_TotalBeforeTax2 = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping2;
            } else {
              this.orderModel.amount_Shipping = 0;
            }

            this.orderModel.amount_TotalBeforeTax = this.orderModel.amount_Subtotal + this.orderModel.amount_Shipping;
            this.orderModel.amount_EstimatedTax = 0;
            this.orderModel.amount_SchucoPartnerDiscount = 0;
            this.orderModel.amount_Total = this.orderModel.amount_TotalBeforeTax + this.orderModel.amount_EstimatedTax - this.orderModel.amount_SchucoPartnerDiscount;
            if (this.orderModel.minAmount_PerOrder > this.orderModel.amount_Total) {
              this.errorMinAmountPerOrder();
            }
            // this.orderModel.amount_Total1 = this.orderModel.amount_TotalBeforeTax1 + this.orderModel.amount_EstimatedTax1 - this.orderModel.amount_SchucoPartnerDiscount;
            // this.orderModel.amount_Total2 = this.orderModel.amount_TotalBeforeTax2 + this.orderModel.amount_EstimatedTax2 - this.orderModel.amount_SchucoPartnerDiscount;
          }
          this.is_buildOrderSummary_running = false;
        });
      }
      else {
        this.orderModel.amount_Subtotal = 0;
        this.is_buildOrderSummary_running = false;
      }
    }
  }
  onChangeQuantity(data: any) {
    this.orderModel.data_AllOrders.filter(f => f.index === data.index)[0].unifiedModel.SRSProblemSetting.Quantity = parseInt(data.Quantity);
    this.configureService.updateProblem(this.orderModel.data_AllOrders.filter(f => f.index === data.index)[0].unifiedModel).pipe(takeUntil(this.destroy$)).subscribe(data1 => {
      this.orderModel.data_AllOrders.filter(f => f.index === data.index)[0].Quantity = data.Quantity;
      this.orderModel.data_AllOrders.filter(f => f.index === data.index)[0].Total = data.Price * parseInt(data.Quantity);
      setTimeout(() => {
        this.buildOrderSummary();
      }, 1);
    });
  }


  calculateShippingCost(state: string) {
    let shippingCost = 0;
    if (state == "TX") { shippingCost = 6000; }
    else if (state == "AZ") { shippingCost = 5500; }
    else if (state == "CA") { shippingCost = 6500; }
    else if (state == "WA") { shippingCost = 7000; }
    else if (state == "OR") { shippingCost = 7000; }
    else if (state == "CO") { shippingCost = 6000; }
    else if (state == "NC") { shippingCost = 7000; }
    else if (state == "SC") { shippingCost = 7000; }
    else if (state == "PA") { shippingCost = 9000; }
    else if (state == "NY") { shippingCost = 9000; }
    else if (state == "CT") { shippingCost = 9000; }
    else if (state == "MA") { shippingCost = 9000; }
    else if (state == "IL") { shippingCost = 7000; }
    else if (state == "UT") { shippingCost = 6000; }
    else if (state == "MT") { shippingCost = 7500; }
    else if (state == null || state == "") { shippingCost = 0; }
    else shippingCost = 8000;
    return shippingCost;
  }

  /*-- Shipping Address -- -------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  continueShippingAddress() {
    setTimeout(() => {
     // if (!this.waitForPostalCodeCheckAPI) {
        this.shippingAddressForm.valid;
        if (this.orderModel.show_ShipToAddress === 'ADDRESS') {
          this.onAddressChange();      
          if (this.shippingAddressForm.valid) {
            if (this.shippingAddressForm.dirty) {
              this.orderModel.show_ShippingAddressPanel = false;
              this.orderModel.valid_ShipToAddress = true;
              this.Location = (this.orderModel.shipping_Address.Address + ', ' + this.orderModel.shipping_Address.Apartment + ', ' + this.orderModel.shipping_Address.City + ', ' + this.orderModel.shipping_Address.State + ' ' + this.orderModel.shipping_Address.PostalCode).replace(", ,", ", ");   
              this.configureService.projectLocation = this.Location;
             // this.shippingAddressPersonDetails = this.orderModel.shipping_Address.Email + ', ' + this.orderModel.shipping_Address.FirstName + ', ' + this.orderModel.shipping_Address.LastName + ', ' + this.orderModel.shipping_Address.PhoneNumber;
             // this.configureService.shippingAddressPersonDetails = this.shippingAddressPersonDetails;
             // this.umService.current_UnifiedModel.ProblemSetting.shippingAddressPersonDetails = this.shippingAddressPersonDetails;
              this.umService.current_UnifiedModel.ProblemSetting.Location = this.Location;
              this.umService.setUnifiedModel(this.umService.current_UnifiedModel);
              let productInfo = {
                ProjectGuid: this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid,
                ProjectName: this.umService.current_UnifiedModel.ProblemSetting.ProjectName,
                Location: this.Location,
                Line1: this.orderModel.shipping_Address.Address,
                Line2: this.orderModel.shipping_Address.Apartment,
                State: this.orderModel.shipping_Address.State,
                City: this.orderModel.shipping_Address.City,
                PostalCode: this.orderModel.shipping_Address.PostalCode
              };
              this.homeService.UpdateProjectInfo(productInfo).pipe(takeUntil(this.destroy$)).subscribe((response) => { });
            }
            this.orderModel.allOrders.Line1 = this.orderModel.shipping_Address.Address;
            this.orderModel.allOrders.Line2 = this.orderModel.shipping_Address.Apartment;
            this.orderModel.allOrders.City = this.orderModel.shipping_Address.City;
            this.orderModel.allOrders.State = this.orderModel.shipping_Address.State;
            this.orderModel.allOrders.PostalCode = this.orderModel.shipping_Address.PostalCode;
            this.shipping_zipcode = this.orderModel.shipping_Address.PostalCode;
    
            this.orderModel.allOrders.County = this.orderModel.shipping_Address.County;
            this.orderModel.allOrders.Country = this.orderModel.shipping_Address.Country;
            this.orderModel.allOrders.Latitude = this.orderModel.shipping_Address.Lat;
            this.orderModel.allOrders.Longitude = this.orderModel.shipping_Address.Lng;
            this.orderModel.allOrders.AddressType = this.orderModel.show_ShipToAddress;
            this.orderModel.allOrders.AdditionalDetails =
              this.orderModel.shipping_Address.Email + "/" +
              (this.orderModel.shipping_Address.Email2 ? this.orderModel.shipping_Address.Email2 : "/") +
              this.orderModel.shipping_Address.FirstName + "/" +
              this.orderModel.shipping_Address.LastName + "/" +
              this.orderModel.shipping_Address.PhoneNumber;
              localStorage.setItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails', this.orderModel.allOrders.AdditionalDetails);
            
          }
        } else {
            this.orderModel.allOrders.AddressType = this.orderModel.show_ShipToAddress;
            this.orderModel.show_ShippingAddressPanel = false;
            this.orderModel.valid_ShipToAddress = true;
    
            this.orderModel.allOrders.Line1 = this.dealerInfo.Line1;
            this.orderModel.allOrders.Line2 = this.dealerInfo.Line2;
            this.orderModel.allOrders.State = this.dealerInfo.State;
            this.orderModel.allOrders.City = this.dealerInfo.City;
            this.orderModel.allOrders.PostalCode = this.dealerInfo.PostalCode;
            this.orderModel.allOrders.AdditionalDetails = "";
        }
        if ((this.orderModel.show_ShipToAddress === 'ADDRESS' && this.shippingAddressForm.valid) || this.orderModel.show_ShipToAddress != 'ADDRESS') {
          // Compute tax rate.
          //this.calculateAndDisplayRoute({lat: this.orderModel.shipping_Address.Lat, lng: this.orderModel.shipping_Address.Lng});
          const that = this;
          that.orderModel.allOrders.TaxRate = undefined;
          this.shipping_zipcode = this.orderModel.allOrders.PostalCode;
          this.buildOrderSummary();
        }  
     // }
    }, 100);    
  }
  opencloseShippingAddress(event: string) {
    this.orderModel.show_ShippingAddressPanel = !this.orderModel.show_ShippingAddressPanel;
    this.isShippingButtonInvalid = false;
    if (event == 'CLOSE') {
      if(this.shipping_zipcode === "") {
         if(!localStorage.getItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails')) {
            this.orderModel.shipping_Address.Email = "";
            this.orderModel.shipping_Address.FirstName = "";
            this.orderModel.shipping_Address.LastName = "";
            this.orderModel.shipping_Address.PhoneNumber = "";
            this.orderModel.shipping_Address.Email2 = "";
            this.orderModel.shipping_Address.PostalCode = "";
            this.buildShippingAddressForm(this.orderModel.shipping_Address);
         }
      }
      else {
        if(!localStorage.getItem(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid+'_ShippingOrderAdditionalDetails')) {
          this.orderModel.shipping_Address.Email = "";
          this.orderModel.shipping_Address.FirstName = "";
          this.orderModel.shipping_Address.LastName = "";
          this.orderModel.shipping_Address.PhoneNumber = "";
          this.orderModel.shipping_Address.Email2 = "";
          this.buildShippingAddressForm(this.orderModel.shipping_Address);
       }
      }
      this.isShippingButtonInvalid = !this.shippingAddressForm.valid;
      if(this.isShippingButtonInvalid){
        if(this.orderModel.show_ShipToAddress !== 'STORE') {
          this.orderModel.valid_ShipToAddress = false;
        }
        
      }
      if (!this.isPinCodeValid) {
        this.errorInvalidPostalCode();
      }
    } //Talk Deepthi
    if (this.orderModel.show_ShippingAddressPanel && !this.orderModel.orderPlaced)
      this.googleSearchAddress();
    setTimeout(() => {
      for (const key in this.shippingAddressForm.controls) {
        if (this.shippingAddressForm.controls[key].valid && Boolean(this.shippingAddressForm.controls[key].value)) {
          this.shippingAddressForm.controls[key].markAsDirty();
          this.shippingAddressForm.controls[key].updateValueAndValidity();
        }
      }
    }, 500);
  }
  ShipTo(event: string) {
    this.orderModel.show_ShipToAddress = event;
  }

  /*-- Disclaimer -- -------------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  cancelAllOrders(): void {
    if (this.calculateDiff(this.orderModel.orderPlacedOn) > 1) {
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '410px',
        nzTitle: '',
        nzContent: this.tplCancelAll,
        nzOkText: "Ok",
        nzOnOk: () => {
        }
      });
    }
    else {
      var deleteorders = this.orderModel.data_AllOrders.filter(f => f.Process == "Delivered");
      if (deleteorders.length > 0) {
        this.ngNotificaionShow({ title: "Can`t delete", message: "Can`t delete this order because some of the orders are already delivered!", logoToShow: 'Trash' });
      } else {
        this.modalService.error({
          nzWrapClassName: "vertical-center-modal",
          nzWidth: '410px',
          nzTitle: '',
          nzContent: "Do you want to cancel the entire order?",
          nzOkText: "Yes",
          nzOnOk: () => {
            this.modalService.error({
              nzWrapClassName: "vertical-center-modal",
              nzWidth: '410px',
              nzTitle: '',
              nzContent: 'Do you want to save the Order and all your Products in “Configure”?',
              nzOkText: "Yes",
              nzOnOk: () => {
                this.homeService.CancelAllOrders(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe(_response => {
                  setTimeout(() => {
                    this.navLayoutService.resetDealerInfo(true);
                    this.orderModel.data_AllOrders = [];
                    this.orderModel.current_ProblemGuid = null;
                    this.orderModel = new OrderModel();
                    //this.buildOrderSummary();
                    this.didCheckout = false;
                    this.ngNotificaionShow({ title: "Items deleted", message: "All the items are deleted now. But all your products remain in Configure.", logoToShow: 'Trash' });
                  }, 100);
                });
              },
              nzCancelText: 'No',
              nzOnCancel: () => {
                this.homeService.DeleteProject(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe(_response => {
                  setTimeout(() => {
                    this.navLayoutService.resetDealerInfo(true);
                    this.router.navigate(['/home']);
                  }, 100);
                });
              }
            });
          },
          nzCancelText: 'No',
          nzOnCancel: () => {
            
          }
        });
      }
    }
  }
  placeOrder(): void {
    this.orderModel.show_Disclaimer = true;
  }

  lowBalance(): void {
    this.modalService.error({
      nzWrapClassName: "vertical-center-modal",
      nzWidth: '450px',
      nzTitle: '',
      nzContent: this.tplLowBalance,
      nzOkText: "Ok",
      nzOnOk: () => {
      }
    });
  }
  errorDownloadingProposal(): void {
    this.modalService.error({
      nzWrapClassName: "vertical-center-modal",
      nzWidth: '250px',
      nzTitle: '',
      nzContent: "Error downloading proposal.",
      nzOkText: "Ok",
      nzOnOk: () => {
      }
    });
  }
  showErrorInvalidPostalCode = false;
  errorInvalidPostalCode(): void {
    if (!this.showErrorInvalidPostalCode && !this.orderModel.orderPlaced) {
      this.showErrorInvalidPostalCode = true;
      this.ngNotificaionShow({ title: "Invalid Postal Code", message: "Please add valid address under 'Shipping Address & Shipping Method'.", logoToShow: 'WarningOrder' });
      this.isShippingButtonInvalid = true;
      // this.modalService.error({
      //   nzWrapClassName: "vertical-center-modal",
      //   nzWidth: '450px',
      //   nzTitle: '',
      //   nzContent: "Invalid Postal Code, please add valid address under 'Shipping Address & Shipping Method'.",
      //   nzOkText: "Ok",
      //   nzOnOk: () => {
      //    // this.showErrorInvalidPostalCode = false;
      //   }
      // });
    }
  }
  showErrorMinAmountPerOrder = false;
  errorMinAmountPerOrder(): void {
    if (!this.showErrorMinAmountPerOrder && !this.orderModel.orderPlaced) {
      this.showErrorMinAmountPerOrder = true;
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '450px',
        nzTitle: '',
        nzContent: "The minimum amount per order is $25,000 USD, please revise your order or please contact your Schüco representative.",
        nzOkText: "Ok",
        nzOnOk: () => {
          //this.showErrorMinAmountPerOrder = false;
        }
      });
    }
  }
  orderNow(): void {
    //this.configureService.placeOrder(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe((resNewOrder) => {
    this.orderModel.valid_ShipToAddress = true;
    this.orderModel.orderPlaced = true;
    this.orderModel.show_Disclaimer = false;
    this.orderModel.allow_ToPlaceOrder = true;

    this.orderModel.allOrders.OrderDetails = [];
    this.orderModel.allOrders.ProjectId = this.orderModel.current_ProjectId;
    this.orderModel.allOrders.DealerId = 0;
    this.orderModel.allOrders.Notes = 'The Note...	';
    this.orderModel.allOrders.ShippingCost = this.orderModel.amount_Shipping;
    this.orderModel.allOrders.Tax = this.orderModel.amount_EstimatedTax;
    this.orderModel.allOrders.Total = this.orderModel.amount_Total;
    this.orderModel.allOrders.Discount = this.orderModel.amount_SchucoPartnerDiscount;
    this.orderModel.allOrders.DiscountPercentage = this.orderModel.amount_SchucoPartnerDiscount;
    this.orderModel.allOrders.ShippingMethod = this.orderModel.type_ShippingMethod === 'STL' ? true : false;

    this.orderModel.data_AllOrders.forEach(element => {
      //this.configureService.GetScreenshotURL(element.problemGuid).subscribe(imageURL => {
      let orderDetails = new OrderDetailsApiModel();
      orderDetails.ProductId = element.productId;
      orderDetails.DesignURL = '';
      orderDetails.JsonURL = '';
      orderDetails.ProposalURL = '';

      orderDetails.OrderDetailscol = "";
      orderDetails.UnitPrice = element.Price;
      orderDetails.Qty = element.Quantity;
      orderDetails.SubTotal = element.Total;
      orderDetails.AdditionalDetails = "";
      //orderDetails.ImagePath = imageURL;
      this.orderModel.allOrders.OrderDetails.push(orderDetails);
      //});
    });
    //this.orderModel.shipping_Address = new ShippingAddressModel();
    //this.orderModel.allOrders.AdditionalDetails = this.dealerInfo.PostalCode;
    if (this.orderModel.shipping_Address)
      this.orderModel.shipping_Address = this.orderModel.shipping_Address;

    this.configureService.CreateOrders(this.orderModel.allOrders).pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        this.configureService.GetProjectOrders(this.orderModel.current_ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe((ordersList) => {
          this.orderModel.allOrders = ordersList;
          setTimeout(() => {
            this.UpdateDealerInfo();
          }, 1000);
        });
      },
      error => {
        setTimeout(() => {
          this.UpdateDealerInfo();
        }, 1000);
      }
    );

    //});
  }
  handleCancel(): void {
    this.orderModel.show_Disclaimer = false;
  }

  /*-- Product Info -- -----------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  readProductInfoData(unified3DModel: BpsUnifiedModel) {
    let product_Dimensions = "";
    if (unified3DModel) {
      if (unified3DModel.ModelInput) {
        if (unified3DModel.ModelInput.Geometry && unified3DModel.ModelInput.Geometry.Points) {
          let max_X_Dimension: number = 0, max_Y_Dimension: number = 0;
          let xDimensions = unified3DModel.ModelInput.Geometry.Points.map(x => x.X);
          let yDimensions = unified3DModel.ModelInput.Geometry.Points.map(x => x.Y);
          if (xDimensions && xDimensions.length > 0)
            max_X_Dimension = xDimensions.reduce((a, b) => Math.max(a, b));
          if (yDimensions && yDimensions.length > 0)
            max_Y_Dimension = yDimensions.reduce((a, b) => Math.max(a, b));
          product_Dimensions = (max_X_Dimension) + ' mm x ' + (max_Y_Dimension) + ' mm';
        }
      }
    }
    return product_Dimensions;
  }
  osLength = 0;
  selectedProduct: any;
  productInfoImage: string = "";
  productType: string = "";
  productDimension: string = "";
  windPressure: string = "";
  ventInfo: string = "";
  bottomOuterFrame: string = "";
  trackType: string = "";
  interLockProfile: string="";
  structuralProfile: string="";
  reinforcementProfile: string="";
  glassInfo:string="";

  showMullion: boolean = false;
  showTransom: boolean = true;
  open_ProductInfoModel(data: any) {
    this.orderModel.show_ProductInfo = true;
    this.productInfoImage = data.ImagePath; 
    this.productType = data.unifiedModel.ProblemSetting.ProductType;
    this.selectedProduct = data.unifiedModel.ModelInput;
    this.showTransom = false;
    this.showMullion = false;
    if(this.selectedProduct && this.selectedProduct.Geometry){
      if(this.selectedProduct.Geometry.Members && this.selectedProduct.Geometry.Members.length > 0){
        this.showMullion = this.selectedProduct.Geometry.Members.map(members => members.MemberType).includes(2);
        this.showTransom = this.selectedProduct.Geometry.Members.map(members => members.MemberType).includes(3);
      }
    }
    if(this.selectedProduct && this.selectedProduct.Geometry && this.selectedProduct.Geometry.GlazingSystems && this.selectedProduct.Geometry.GlazingSystems[0]
        && this.selectedProduct.Geometry.GlazingSystems[0].Description)
      this.glassInfo = this.selectedProduct.Geometry.GlazingSystems[0].Description.split('+');
    if (this.productType == "SlidingDoor") {
      if (this.selectedProduct.Geometry) {
        if (this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 42 && f.SectionType == 42))
          this.interLockProfile = this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 42 && f.SectionType == 42)[0].ArticleName;
        if (this.selectedProduct.Geometry.SlidingDoorSystems && this.selectedProduct.Geometry.SlidingDoorSystems.length>0){
          this.structuralProfile = this.selectedProduct.Geometry.SlidingDoorSystems[0].StructuralProfileArticleName;
          this.reinforcementProfile = this.selectedProduct.Geometry.SlidingDoorSystems[0].SteelTubeArticleName; 
        }
        if (this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43))
          this.ventInfo = this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43)[0].ArticleName;
        if (this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 45 && f.SectionType == 45))
          this.bottomOuterFrame = this.selectedProduct.Geometry.Sections.filter(f => f.SectionID == 45 && f.SectionType == 45)[0].ArticleName
        if (this.selectedProduct.Geometry.OperabilitySystems && this.selectedProduct.Geometry.OperabilitySystems[0] && this.selectedProduct.Geometry.OperabilitySystems[0].VentOperableType) {
          let trackTypeText = this.selectedProduct.Geometry.OperabilitySystems[0].VentOperableType.split('-');
          if (trackTypeText && trackTypeText[1] && trackTypeText[2] && trackTypeText[3])
            this.trackType = trackTypeText[1] + " - " + trackTypeText[2] + " " + trackTypeText[3];
        }
      }
    }
    if (this.selectedProduct.Geometry.OperabilitySystems)
      this.selectedProduct.Geometry.OperabilitySystems.forEach(element => {
        element.Infills = this.selectedProduct.Geometry.Infills.filter(f => f.OperabilitySystemID == element.OperabilitySystemID);
      });
    this.productDimension = data.DIMENSION;
    this.osLength = this.selectedProduct.Geometry.OperabilitySystems ? this.selectedProduct.Geometry.OperabilitySystems.length : 0;
    const wp = data.unifiedModel.ModelInput.Structural.WindLoad ? data.unifiedModel.ModelInput.Structural.WindLoad.toFixed(2) : "1.68"
    if (wp === "1.68") this.windPressure = "35 psf (1.68 kN/m^2)";
    if (wp === "2.16") this.windPressure = "45 psf (2.16 kN/m^2)";
    if (wp === "2.39") this.windPressure = "50 psf (2.39 kN/m^2)";
  }
  cancel_ProductInfoModel() {
    this.orderModel.show_ProductInfo = false;
    this.productInfoImage = "";
    this.productType = "";
    this.selectedProduct = null;
    this.productDimension = "";
    this.ventInfo = "";
    this.bottomOuterFrame = "";
    this.trackType = "";
    this.structuralProfile = "";
    this.interLockProfile = "";
    this.reinforcementProfile = "";
    this.glassInfo = "";
  }

  calcualteProductWeight(unified3DModel: BpsUnifiedModel) {
    let weight = 0.0;
    if (unified3DModel) {
      if (unified3DModel.ModelInput.Geometry) {
        let geometry = unified3DModel.ModelInput.Geometry;
        // calcualte infill weight, including glass weight and vent weight
        let infillWeight = 0.0;
        for (let glass of geometry.Infills) {
          let glassthickness = 0.0;
          let left = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[0]);
          let minX = geometry.Points.find(x => x.PointID == left.PointA).X;

          let right = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[2]);
          let maxX = geometry.Points.find(x => x.PointID == right.PointA).X;

          let top = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[1]);
          let maxY = geometry.Points.find(x => x.PointID == top.PointA).Y;

          let bottom = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[3]);
          let minY = geometry.Points.find(x => x.PointID == bottom.PointA).Y;

          let width = (maxX - minX) / 1000 //m
          let height = (maxY - minY) / 1000 //m

          let area = height * width; //sqm
          let glazingSystem = geometry.GlazingSystems.find(item => item.GlazingSystemID == glass.GlazingSystemID);
          for (let plate of glazingSystem.Plates) {
            glassthickness += plate.H; //mm  
          }
          // operable vent, VentWeight includes the glass and vent frame weight
          if (glass.OperabilitySystemID != -1) { infillWeight += glass.VentWeight; }
          // fixed vent
          else {
            infillWeight += (glassthickness / 1000) * area * 2500;
          }

        }
        // calculate member(mullion, transom) weight
        let totalLength = 0.0;
        let memberWeight = 0.0;
        for (let member of geometry.Members) {
          let length = 0.0;
          let x1 = geometry.Points.find(x => x.PointID == member.PointA).X;
          let x2 = geometry.Points.find(x => x.PointID == member.PointB).X;
          let y1 = geometry.Points.find(x => x.PointID == member.PointA).Y;
          let y2 = geometry.Points.find(x => x.PointID == member.PointB).Y;
          let section = geometry.Sections.find(item => item.SectionID == member.SectionID);
          if (x1 == x2) { length = Math.abs(y1 - y2) / 1000; } //m
          else { length = Math.abs(x1 - x2) / 1000; } //m
          memberWeight += length * section.Weight; // m * kg/m = kg
        }
        weight = memberWeight + infillWeight;
      }
    }
    return weight;
  }



  /*-- Cancel Order -- -----------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  cancel_Order(event: any) {
    if (event.OrderStatus) {
      var hours = this.timeDiffCalc(new Date(event.OrderStatus.filter(f => f.StatusId == 1)[0].StatusModifiedOn), new Date())
      if (hours > 24) {
        this.modalService.error({
          nzWrapClassName: "vertical-center-modal",
          nzWidth: '410px',
          nzTitle: '',
          nzContent: this.tplCancel,
          nzOkText: "Ok",
          nzOnOk: () => {

          }
        });
      }
      else {
        this.modalService.error({
          nzWrapClassName: "vertical-center-modal",
          nzWidth: '410px',
          nzTitle: '',
          nzContent: "Are you sure you want to delete this order?",
          nzOkText: "Yes",
          nzOnOk: () => {
            this.removeProduct(event.problemGuid);
          },
          nzCancelText: 'No',
          nzOnCancel: () => {
            
          }
        });
      }
    } else {
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '410px',
        nzTitle: '',
        nzContent: "Are you sure you want to delete this order?",
        nzOkText: "Yes",
        nzOnOk: () => {
          this.removeProduct(event.problemGuid);
        },
        nzCancelText: 'No',
        nzOnCancel: () => {
          
        }
      });
    }
  }


  /*-- Product Image -- ----------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  setDefaultImage(productInfoImage: any) {
    productInfoImage = this.permissionService.checkPermission(Feature.WindowDefaultImageV2) ? '/assets/Images/window_default_SRS.png' : '/assets/Images/window__default.png';
    //productInfoImage = '/assets/Images/window__default.png';
  }


  /*-- Download Product Proposal -- ----------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  GenerateProposal_FromJsonFile(proposalOrBOM: string = "Proposal") {
    this.homeService.GenerateProposal_FromJsonFile(proposalOrBOM).pipe(takeUntil(this.destroy$)).subscribe(result => {
    });
  }

  OpenProposalFile(proposalOrBOM: string = "Proposal") {
    this.homeService.GetProposalFile(this.orderModel.current_ProblemGuid, proposalOrBOM).pipe(takeUntil(this.destroy$)).subscribe(result => {
      let blob = new Blob([result], { type: 'application/pdf' });
      let url1 = window.URL.createObjectURL(blob);
      window.open(url1);
    });
  }

  DownloadProposalFile(filename: string, proposalOrBOM: string = "Proposal") {
    this.homeService.GetProposalFile(this.orderModel.current_ProblemGuid, proposalOrBOM).pipe(takeUntil(this.destroy$)).subscribe(res => {
      var url = window.URL.createObjectURL(res);
      var a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.target = "_blank";
      a.href = url;
      res.filename = filename;
      a.download = res.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove(); // remove the element
    }, error => {
      console.log('download error:', JSON.stringify(error));
    }, () => {
      console.log('Completed file download.')
    });
  }
  downloadProposalOrder(id: string, proposalOrBOM: string = "Proposal") {
    this.homeService.GetProposalFile(id, proposalOrBOM).pipe(takeUntil(this.destroy$)).subscribe(result => {
      let blob = new Blob([result], { type: 'application/pdf' });
      let url1 = window.URL.createObjectURL(blob);
      window.open(url1);
    });
  }

  isLoadingOne: boolean = false;
  downloadProposalOrderZip(id: string, proposalOrBOM: string = "Proposal") {
    this.isLoadingOne = true;
    let dateFormat = this.language && this.language == 'de-DE' ? 'dd_MMM_yyyy' : 'MMM_dd_yyyy';
    let pipe = new DatePipe(this.language);

    this.homeService.GenerateProposalZipFile(id, proposalOrBOM).pipe(takeUntil(this.destroy$)).subscribe(result => {
      let blob = new Blob([result], { type: 'application/zip' });
      FileSaver.saveAs(blob, this.configureService.projectName + '_' + pipe.transform(Date.now(), dateFormat) + '.zip');
      // let url1 = window.URL.createObjectURL(blob);
      // window.open(url1);
      this.isLoadingOne = false;
    }, (error: any) => {
      this.isLoadingOne = false;
      this.errorDownloadingProposal();
    });
  }
  downloadProposal(proposalOrBOM: string = "Proposal") {
    // this.orderModel.data_AllOrders.forEach(element => {
    //   this.downloadProposalOrder(element.problemGuid);
    // });
    this.downloadProposalOrderZip(this.orderModel.current_ProjectGuid, proposalOrBOM);
    //this.OpenProposalFile();
    //this.DownloadProposalFile("Download_Proposal.pdf");
  }

  /*-- Remove Product From actual list -------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  removeProduct(problemGuid: string) {
    this.modalService.error({
      nzWrapClassName: "vertical-center-modal",
      nzWidth: '470px',
      nzTitle: '',
      nzContent: 'Are you sure you want to delete this Product from your Order? <br/><br/> By clicking YES you will lose your configured Product in “Configure”.',
      nzOkText: "Yes",
      nzOnOk: () => {
        //DeleteOrderByGuid
        this.homeService.DeleteProblemByGuid(problemGuid).pipe(takeUntil(this.destroy$)).subscribe((deletedProblemGuid) => {
          this.orderModel.data_AllOrders = this.orderModel.data_AllOrders.filter(f => f.problemGuid !== problemGuid);
          if(this.orderModel.current_ProblemGuid == deletedProblemGuid && this.orderModel.data_AllOrders.length>0){
            this.orderModel.current_ProblemGuid = this.orderModel.data_AllOrders[0].problemGuid;
            this.router.navigate(['/orders/',  this.orderModel.current_ProblemGuid]);
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                this.router.navigate(["/orders/"+this.orderModel.current_ProblemGuid]);
            });
          }
          this.buildOrderSummary();
          if (this.orderModel.data_AllOrders.length == 0) {
            this.ngNotificaionShow({ title: "Items deleted", message: "There are no items left and you will be redirected to Home page", logoToShow: 'Trash' });
            this.orderModel = new OrderModel();
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 500);
          }
        });
      },
      nzCancelText: 'Cancel',
      nzOnCancel: () => {
        
      }
    });

  }

  timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    

    let totalhours = 0;
    let difference = '';
    if (days > 0) { difference += (days === 1) ? `${days} day, ` : `${days} days, `; totalhours = days * 24 }
    difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `; totalhours += hours;
    difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`; totalhours += minutes / 60;
    return totalhours;
  }


  _address: Address;
  @ViewChild('addressText') addressText: any;
  autocomplete: google.maps.places.Autocomplete;
  googleSearchAddress() {
    this.showGoogleMap = false;
    const self = this;
    const googleUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + this.appConstantService.GOOGLE_API_KEY;
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

  private getPlaceAutocomplete(): void {
    setTimeout(() => {
      if (this.addressText) {
        const autocomplete = new google.maps.places.Autocomplete(this.addressText.nativeElement,
          {
            types: ['geocode', 'establishment']
          });

        google.maps.event.addListener(autocomplete, 'place_changed', () => {
          const place = autocomplete.getPlace();
          this.showGoogleMap = true;
          this._address = <Address>{};
          for (let i = 0; i < place.address_components!.length; i++) {
            const addressType = place.address_components![i].types[0];
            if ((addressStructure as any)[addressType]) {
              const val = (place.address_components![i] as any)[(addressStructure as any)[addressType]];
              if (val !== undefined) {
                if (addressType === 'sublocality_level_1') { this._address.Line2 = val; }
                // tslint:disable-next-line: one-line
                else if (addressType === 'country') { this._address.Country = val; }
                // tslint:disable-next-line: one-line
                else if (addressType === 'locality') { this._address.City = val; }
                // tslint:disable-next-line: one-line
                else if (addressType === 'administrative_area_level_1') { this._address.State = val; }
                // tslint:disable-next-line: one-line
                else if (addressType === 'administrative_area_level_2') { this._address.County = val; }
                // tslint:disable-next-line: one-line
                else if (addressType === 'postal_code') { this._address.PostalCode = val; }
              }
            }
          }
          // Line1 was missing
          this._address.Lat = place.geometry.location.lat();
          this._address.Lng = place.geometry.location.lng();
          this._address.Line1 = place.name;
          this.onAddressAutocomplete(this._address);
          //this.initMap();
        });
      }
    }, 500);
  }
  showGoogleMap: boolean = false;
  // @ViewChild('gmap') gmap: any;
  // initMap() {
  //   this.showGoogleMap = true;
  //   const that = this;
  //   if (that._address && that.gmap.nativeElement) {
  //     var latlng = new google.maps.LatLng(that._address.Lat ? that._address.Lat : 28.5355161, that._address.Lng ? that._address.Lng : 77.39102649999995);
  //     var map = new google.maps.Map(that.gmap.nativeElement, {
  //       center: latlng,
  //       zoom: 16,
  //       styles: [
  //         { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  //         { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  //         { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  //         {
  //           featureType: "administrative.locality",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#d59563" }],
  //         },
  //         {
  //           featureType: "poi",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#d59563" }],
  //         },
  //         {
  //           featureType: "poi.park",
  //           elementType: "geometry",
  //           stylers: [{ color: "#263c3f" }],
  //         },
  //         {
  //           featureType: "poi.park",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#6b9a76" }],
  //         },
  //         {
  //           featureType: "road",
  //           elementType: "geometry",
  //           stylers: [{ color: "#38414e" }],
  //         },
  //         {
  //           featureType: "road",
  //           elementType: "geometry.stroke",
  //           stylers: [{ color: "#212a37" }],
  //         },
  //         {
  //           featureType: "road",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#9ca5b3" }],
  //         },
  //         {
  //           featureType: "road.highway",
  //           elementType: "geometry",
  //           stylers: [{ color: "#746855" }],
  //         },
  //         {
  //           featureType: "road.highway",
  //           elementType: "geometry.stroke",
  //           stylers: [{ color: "#1f2835" }],
  //         },
  //         {
  //           featureType: "road.highway",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#f3d19c" }],
  //         },
  //         {
  //           featureType: "transit",
  //           elementType: "geometry",
  //           stylers: [{ color: "#2f3948" }],
  //         },
  //         {
  //           featureType: "transit.station",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#d59563" }],
  //         },
  //         {
  //           featureType: "water",
  //           elementType: "geometry",
  //           stylers: [{ color: "#17263c" }],
  //         },
  //         {
  //           featureType: "water",
  //           elementType: "labels.text.fill",
  //           stylers: [{ color: "#515c6d" }],
  //         },
  //         {
  //           featureType: "water",
  //           elementType: "labels.text.stroke",
  //           stylers: [{ color: "#17263c" }],
  //         },
  //       ],
  //     });
  //     var marker = new google.maps.Marker({
  //       map: map,
  //       position: latlng,
  //       draggable: true,
  //       anchorPoint: new google.maps.Point(0, -29)
  //     });
  //     // this function will work on marker move event into map 
  //     google.maps.event.addListener(marker, 'dragend', function () {
  //       that._address.Lat = marker.getPosition()?.lat();
  //       that._address.Lng = marker.getPosition()?.lng();
  //       console.log(marker.getPosition()?.lat(), marker.getPosition()?.lng())
  //       that.onAddressAutocomplete(that._address);
  //     });
  //     // this.calculateAndDisplayRoute({
  //     //   lat: that._address.Lat,
  //     //   lng: that._address.Lng
  //     // });
  //   }
  // }

  disableDownloadProposal() {
    return this.orderModel.data_AllOrders.length <= 0 || this.isLoadingOne;
  }
  onAddressAutocomplete(event: Address): void {
    this.orderModel.shipping_Address.Address = event.Line1;
    this.orderModel.shipping_Address.Apartment = event.Line2;
    this.orderModel.shipping_Address.PostalCode = event.PostalCode;
    this.orderModel.shipping_Address.City = event.City;
    this.orderModel.shipping_Address.State = event.State;
    this.orderModel.shipping_Address.Country = event.Country;
    this.orderModel.shipping_Address.County = event.County;
    this.orderModel.shipping_Address.Lat = event.Lat;
    this.orderModel.shipping_Address.Lng = event.Lng;
    setTimeout(() => {
      this._address = event;
    }, 10);
  }

  calculateAndDisplayRoute(point): void {
    var directionsService = new google.maps.DirectionsService;
    const that = this;
    directionsService.route({
      //origin: new google.maps.LatLng(50.66956513913178, 17.922616861760625),
      origin: new google.maps.LatLng(20.617360, -100.434715),
      destination: point,
      travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
      if (status === 'OK') {
        var distance = response.routes[0].legs[0].distance.text;
        var duration = response.routes[0].legs[0].duration.text;

        that.orderModel.allOrders.Distance = response.routes[0].legs[0].distance.value;
        //directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  checkInvalidPostalCodeDisplayRemoval() {
    if (this.shippingAddressForm.get('PostalCode').status == "VALID") {
      this.showErrorInvalidPostalCode = false;
      this.notifCustomTemplate.notificationRemove();
    }
  }

}
function saveAs(blob: Blob, arg1: string): void {
  throw new Error('Function not implemented.');
}



