import { Component, OnInit, HostListener, Input, Output, AfterViewInit, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as uuid from 'uuid';
import { IFrameExchangeData, IFrameEvent } from '../../../models/iframe-exchange-data';
import { Subscription, Observable, Subject } from 'rxjs';
import { OuterTableComponent } from '../side-panels/outer-table/outer-table.component';
import { VentTableComponent } from '../side-panels/vent-table/vent-table.component';
import { MullionTableComponent } from '../side-panels/mullion-table/mullion-table.component';
import { HingeTypeComponent } from '../side-panels/hinge-type/hinge-type.component';
import { InsideHandleComponent } from '../side-panels/inside-handle/inside-handle.component';
import { OutsideHandleComponent } from '../side-panels/outside-handle/outside-handle.component';
import { DoorLeafActiveComponent } from '../side-panels/door-leaf-active/door-leaf-active.component';
import { DoorLeafPassiveComponent } from '../side-panels/door-leaf-passive/door-leaf-passive.component';
import { SillProfileFixedComponent } from '../side-panels/sill-profile-fixed/sill-profile-fixed.component';
import { SillProfileBottomComponent } from '../side-panels/sill-profile-bottom/sill-profile-bottom.component';
import { FrameCombinationTableComponent } from '../side-panels/frame-combination-table/frame-combination-table.component';
import { HandleColorComponent } from '../side-panels/handle-color/handle-color.component';
import { ProfileColorComponent } from '../side-panels/profile-color/profile-color.component';

import { GlassPanelTableComponent } from '../side-panels/glass-panel-table/glass-panel-table.component';
import { MullionDepthTableComponent } from '../mullion-depth-table/mullion-depth-table.component';
import { StructuralTableComponent } from '../side-panels/structural-table/structural-table.component';
import { SpacerTypeComponent } from '../spacer-type/spacer-type.component';

import { FramingCustomComponent } from '../framing-custom/framing-custom.component';

import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/app-common/services/notification.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { Feature } from 'src/app/app-core/models/feature';
import { takeUntil } from 'rxjs/operators';
import { LibraryCustomComponent } from '../side-panels/library-custom/library-custom.component';

@Component({
  selector: 'app-iframe-wrapper',
  templateUrl: './iframe-wrapper.component.html',
  styleUrls: ['./iframe-wrapper.component.css']
})
export class IframeWrapperComponent implements OnInit, AfterViewInit, OnChanges {
  // unique identifier for the iframe (random uuid)
  ExchangeId: string = uuid.v4();
  // url to be loaded in the iframe
  IFrameURL: SafeResourceUrl | undefined;
  // the iframe itself
  IFrame: HTMLIFrameElement | undefined | null;
  // event subsciption for parent events
  // private parentEventsSubscription: Subscription | undefined;

  // two types of events: 'Loaded' will only be calle once. you cannot send events before this is done.
  @Output() Loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  // the second type of event
  @Output() ChildEvents: EventEmitter<IFrameEvent> = new EventEmitter<IFrameEvent>();

  @Input()
  set iframeId(id: string | undefined) {
    if (typeof id === "undefined") {
      return;
    }
    this.ExchangeId = id;
  }
  get iframeId() {
    return this.ExchangeId;
  };

  @Input()
  set URL(thisUrl: string | undefined) {
    if (typeof thisUrl === 'undefined') { return; }
    this.IFrameURL = this.domSanitizer.bypassSecurityTrustResourceUrl(thisUrl + (thisUrl.includes('?') ? '&' : '?') + "exchangeId=" + this.ExchangeId);
  }
  get URL() {
    return this.IFrameURL as string;
  }

  //@Input() viewerHeight: number|undefined;


  // to handle the events gracefully, we intecept them and pass them straight to 'postMessage event'
  // _parentEvent: IFrameEvent = new IFrameEvent();
  @Input() iframeEvent: Subject<IFrameEvent>;
  @Input() ParentEvents: Observable<IFrameEvent> | undefined;
  @Input() isGlassPanelActive: boolean;
  @Input() systemSelected: string;                        // system for window
  @Input() systemFacadeSelected: string = 'aws__75_si_plus';
  @Input() systemFacadeSelectedFromFraming: string;
  @Input() currentHandleColorFromParent: any;
  @Input() currentHingeTypeFromParent: any;
  @Input() currentInsideHandleFromParent: any;
  @Input() currentOutsideHandleFromParent: any;
  @Input() dinWindLoad: any;
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() event3D: any;
  @Input() activePanel: any;
  @Input() problem: BpsUnifiedProblem;
  @Input() canBeDrawnBool: boolean;
  @Input() disableCheckout: boolean;
  @Output() sendPressureValueEvent: EventEmitter<any> = new EventEmitter<void>();
  @Output() changeLibraryInputValueEvent: EventEmitter<any> = new EventEmitter<any>()
  @Output() confirmSpacerTypeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendFormDataEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeNdisableRightPanelEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();
  @Output() subTotalEvent: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('glassPanel') glassPanelTableComponent: GlassPanelTableComponent;
  @ViewChild('structuralTable') structuralTableComponent: StructuralTableComponent;
  @ViewChild('OuterTable') outerTable: OuterTableComponent;
  @ViewChild('HandleColorTable') handleColorTable: HandleColorComponent;
  @ViewChild('HingeTypeTable') hingeTypeTable: HingeTypeComponent;
  @ViewChild('InsideHandleTable') insideHandleTable: InsideHandleComponent;
  @ViewChild('OutsideHandleTable') outsideHandleTable: OutsideHandleComponent;
  @ViewChild('VentTable') ventTable: VentTableComponent;
  @ViewChild('DoubleVentTable') doubleVentTable: VentTableComponent;
  @ViewChild('StructuralProfileTable') structuralProfileTable: VentTableComponent;
  @ViewChild('InterlockTable') InterlockTable: VentTableComponent;
  @ViewChild('ReinforcementTable') ReinforcementTable: VentTableComponent;
  @ViewChild('DoorLeafActiveTable') doorLeafActiveTable: DoorLeafActiveComponent;
  @ViewChild('DoorLeafPassiveTable') doorLeafPassiveTable: DoorLeafPassiveComponent;
  @ViewChild('SillProfileFixedTable') sillProfileFixedTable: SillProfileFixedComponent;
  @ViewChild('SillProfileBottomTable') sillProfileBottomTable: SillProfileBottomComponent;
  @ViewChild('FrameCombinationTable') frameCombinationTable: FrameCombinationTableComponent;
  @ViewChild('MullionTable') mullionTable: MullionTableComponent;
  @ViewChild('spacerType') spacerType: SpacerTypeComponent;
  @ViewChild('custom') customFraming: FramingCustomComponent;
  @ViewChild('customlibrary') customLibrary: LibraryCustomComponent;
  @ViewChild('axesHelper') axesHelperButton: any;
  @ViewChild('glassId') glassIdButton: any;
  @ViewChild('controlsGrid') controlsGridButton: any;
  //facades
  @ViewChild('MullionDepthTable') mullionDepthTable: MullionDepthTableComponent;
  displayControlEditBool: boolean = true;
  disableControlDeleteBool: boolean = false;
  displayControlsBool: boolean = false;
  displayCopyControlsBool: boolean = false;
  selectAxesBool: boolean = false;
  selectGridIdBool: boolean = false;
  selectGridBool: boolean = true;
  disableMullionAndTransom: boolean = false;
  selectOutsideBool: boolean = true;
  selectInsideBool: boolean = false;
  dateLastModified: string;
  inConfigureBool: boolean;
  language: string = 'en-US';
  selectedMajorMullionIDs: [] = [];
  selectIntermediateIDs: [] = [];
  selectedGlassIDs: number[] = [];

  loadingCopyDelete: boolean = false;
  isCheckoutButtonEnabled: boolean = false;
  isCheckoutDisableInvalLargeDim: boolean = false;
  isCheckoutDisableInvalSmallDim: boolean = false;

  //#region Profile Color
  @Input() currentProfileColorFromParent: any;
  @ViewChild('profileColorTable') profileColorTable: ProfileColorComponent;
  applicationType: string;
  calculatedSubTotal: number;
  isMullionButtonBarDisplay: boolean = true;
  // selectedIndex = 0;
  //#endregionProfile color ends

  @Output() isCheckoutClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() orderPlaced: boolean;
  feature = Feature;
  private destroy$ = new Subject<void>();
  constructor(
    private umService: UnifiedModelService,
    private cpService: ConfigPanelsService,
    public ifService: IframeService,
    public domSanitizer: DomSanitizer,
    private configureService: ConfigureService,
    private router: Router,
    private notification: NotificationService,
    private permissionService: PermissionService) {
    this.applicationType = this.configureService.applicationType;
  }

  ngOnInit() {
    /*this.unified3DModel = this.umService.current_UnifiedModel;*/
    this.calculatedSubTotal = this.unified3DModel && this.unified3DModel.SRSProblemSetting && this.unified3DModel.SRSProblemSetting.SubTotal ?
      this.unified3DModel.SRSProblemSetting.SubTotal : 0;

 /**
 * This is observable of Unified Problem which will calls when the unified Problem  has changed anywhere in the application 
 * and will set the Invalid large and small dimensions to false
 */
      this.umService.obsUnifiedProblem.pipe(takeUntil(this.destroy$)).subscribe(response => {
        if (response) {
          this.isCheckoutDisableInvalLargeDim = false;
          this.isCheckoutDisableInvalSmallDim = false;
        }
      });
      /*this.collectDataAfterProductChange();*/

 /**
 * This is observable of Unified Model which will calls when the unified model has changed anywhere in the application
 * and will set the values for the input fields and also calculate subtotal cost for default model
 */
      this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if (response) {
            this.unified3DModel = response;
            this.CalculateSubTotalCost();
          }
        });

        this.configureService.obsMullionButtonsBar.pipe(takeUntil(this.destroy$)).subscribe((res) => {
          this.isMullionButtonBarDisplay = res;
        });
  
  
      if (this.ParentEvents != undefined) {
        this.ParentEvents.pipe(takeUntil(this.destroy$)).subscribe((event: IFrameEvent) => this.postMessage(event));
      }
      this.inConfigureBool = this.router.url.substr(1, 6) == "proble";
      this.configureService.computeClickedSubject.pipe(takeUntil(this.destroy$)).subscribe((isClicked) => {
        if (!isClicked) {
          this.dateLastModified = this.ifService.getLastModifiedDate(new Date());
        }
        setTimeout(() => {
          if (this.permissionService.checkPermission(Feature.CalculateSubTotalCost))
            this.CalculateSubTotalCost();
        }, 100);
      });
      this.configureService.checkoutButtonEnabled.pipe(takeUntil(this.destroy$)).subscribe((isValid) => {
        this.isCheckoutButtonEnabled = isValid;
      });
  }


  // onTabChange(event){
  //   this.selectedIndex = event;
  //   if (event === 0) {
  //     this.iframeEvent.next(new IFrameEvent('setOutsidePosition'));
  //   } else {
  //     this.iframeEvent.next(new IFrameEvent('setInsidePosition'));
  //   }
  // }

 /**
 * This function is used to call the event in the 3D Model to view the model as in outside view
 * 
 * and also to display the outside button in the 3D viewer as selected
 * 
 */
  onClickOutside() {
    this.selectOutsideBool = true;
    this.selectInsideBool = false;
    this.iframeEvent.next(new IFrameEvent('setOutsidePosition'));
  }

 /**
 * This function is used to call the event in the 3D Model to view the model as in inside view
 * 
 * and also to display the inside button in the 3D viewer as selected
 * 
 */
  onClickInside() {
    this.selectInsideBool = true;
    this.selectOutsideBool = false;
    this.iframeEvent.next(new IFrameEvent('setInsidePosition'));
  }

 /**
 * This function is used to calculate the subcost for the model configured
 * 
 */
  CalculateSubTotalCost() {
    let subTotal = this.ifService.CalculateSubTotalCost(this.unified3DModel);
    this.calculatedSubTotal = subTotal? subTotal:0;
    this.configureService.subTotalFromIframeSubject.next(this.calculatedSubTotal);
    if (this.unified3DModel.SRSProblemSetting !== undefined && this.unified3DModel.SRSProblemSetting !== null)
      this.unified3DModel.SRSProblemSetting.SubTotal = subTotal;
    this.subTotalEvent.emit(subTotal);
  }

 /**
 * This function is used to call the event in the 3D Model to reset the display settings with default ones.
 * 
 */
  restoreDispalySetting() {
    this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: this.ifService.getDisplaySettings_Default() }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showChildViews = false;
  ngAfterViewInit(): void {

    this.collectDataAfterProductChange();
    setTimeout(() => {
      this.showChildViews = true;
    }, 1);  

 /**
 * This is observable Subscription to set the Check out button disable whenever the model dimensions are changed to Invalid large Dimensions
 * 
 */
    this.cpService.obsCheckoutDisable_InvalidLargeDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalLargeDim = response;
      });

 /**
 * This is observable Subscription to set the Check out button disable whenever the model dimensions are changed to Invalid small Dimensions
 * 
 */
    this.cpService.obsCheckoutDisable_InvalidSmallDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalSmallDim = response;
      });
  
  }

 /**
 * This function is called to display the notification message in the custom notification component
 * 
 * @param {any} event which is the object having title, message and icon to display in the notification
 * 
 */
  ngNotificaionShowEvent(event: any) {
    this.ngNotificaionShow.next(event);
  }
  collectDataAfterProductChange(loadHandleColor: boolean = true) {
    setTimeout(() => {
      if (this.unified3DModel !== undefined && this.unified3DModel.ProblemSetting.ProductType == "Window") {
        // if (this.outerTable && this.systemSelected) {
        //   this.outerTable.collectData(this.systemSelected);
        // }
        // if (this.ventTable && this.systemSelected) {
        //   this.ventTable.collectData(this.systemSelected);
        // }
        // if (this.doorLeafActiveTable && this.systemSelected) {
        //   this.doorLeafActiveTable.collectData(this.systemSelected);
        // }
        // if (this.doorLeafPassiveTable && this.systemSelected) {
        //   this.doorLeafPassiveTable.collectData(this.systemSelected);
        // }
        // if (this.sillProfileFixedTable && this.systemSelected) {
        //   this.sillProfileFixedTable.collectData(this.systemSelected);
        // }
        // if (this.sillProfileBottomTable && this.systemSelected) {
        //   this.sillProfileBottomTable.collectData(this.systemSelected);
        // }
        // if (this.mullionTable && this.systemSelected) {
        //   this.mullionTable.collectData(this.systemSelected);
        // }
        // if (this.handleColorTable && loadHandleColor) {
        //   this.handleColorTable.collectData();
        // }
        // if (this.hingeTypeTable && loadHandleColor) {
        //   this.hingeTypeTable.collectData();
        // }
        // if (this.insideHandleTable && loadHandleColor) {
        //   this.insideHandleTable.collectData();
        // }
        // if (this.outsideHandleTable && loadHandleColor) {
        //   this.outsideHandleTable.collectData();
        // }
        // if (this.profileColorTable) {
        //   this.profileColorTable.collectData();
        // }
      }
      if (this.unified3DModel !== undefined && this.unified3DModel.ProblemSetting.ProductType == "Facade") {
        // if (this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom' && this.mullionDepthTable && this.systemFacadeSelectedFromFraming) {
        //   this.mullionDepthTable.collectMullionDepthData(this.systemFacadeSelectedFromFraming);
        // }
        // if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC' && this.mullionDepthTable && this.systemFacadeSelectedFromFraming) {
        //   this.mullionDepthTable.collectUDCFramingFacadData(this.systemFacadeSelectedFromFraming, null);
        // }

        // if (this.frameCombinationTable && this.systemFacadeSelected) {
        //   this.frameCombinationTable.collectData(this.systemFacadeSelected);
        // }
        // if (this.outerTable && this.systemFacadeSelected) {
        //   if (this.systemFacadeSelected.toLowerCase().indexOf('fws') > -1)
        //     this.systemFacadeSelected = 'aws__75_si_plus';
        //   this.outerTable.collectData(this.systemFacadeSelected);
        // }
        // if (this.ventTable && this.systemFacadeSelected) {
        //   if (this.systemFacadeSelected.toLowerCase().indexOf('fws') > -1)
        //     this.systemFacadeSelected = 'aws__75_si_plus';
        //   this.ventTable.collectData(this.systemFacadeSelected);
        // }
      }
    }, 1000);
  }

  ngOnChanges(Changes: SimpleChanges): void {
    // this.onTabChange(this.selectedIndex);
    if (Changes) {
      if (Changes.isGlassPanelActive) {
        if (!Changes.isGlassPanelActive.currentValue) {
          this.cpService.setPopout(false, PanelsModule.GlassPanel);
        }
      }
      if (Changes.unified3DModel !== undefined && Changes.unified3DModel.previousValue !== undefined) {// && Changes.unified3DModel.previousValue.ProblemSetting.ProductType !== this.unified3DModel.ProblemSetting.ProductType
        this.unified3DModel = Changes.unified3DModel.currentValue;
        setTimeout(() => {
          this.collectDataAfterProductChange();
        });
      }
      if (Changes.systemFacadeSelectedFromFraming && !Changes.systemFacadeSelectedFromFraming.firstChange) {
        this.collectDataAfterProductChange(false);
      }
      if (Changes.systemSelected && !Changes.systemSelected.firstChange) {
        this.collectDataAfterProductChange(false);
      }
      if (Changes.systemFacadeSelected && !Changes.systemFacadeSelected.firstChange) {
        this.collectDataAfterProductChange(false);
      }

      if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'selectGlass') {  // when user selects glass from 3D viewer
        var panels = this.unified3DModel.ModelInput.Geometry.Infills.filter(f => f.GlazingSystemID != -1).map(f => f.InfillID);
        this.selectedGlassIDs = Changes.event3D.currentValue.value.selectedGlassIDs.filter(f => panels.includes(f))
      }

      // if(Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'SelectedDoorGlass') {
      //   this.disableMullionAndTransom = Changes.event3D.currentValue.value;
      // }

      if (Changes.event3D && !Changes.event3D.firstChange) {
        // if (this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition) {
        //   setTimeout(() => {
        //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: { showBCSymbols: this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition } }));
        //   }, 100);
        // }
        switch (this.event3D.eventType) {
          case "selectIntermediate":
            this.selectIntermediateIDs = this.event3D.value;
          case "selectMajorMullion": //selectFacadeMember
            this.selectedMajorMullionIDs = this.event3D.value.selectedMajorMullionIDs;
          case 'restoreDispalySetting':
            break;
          case 'showControlEdit':
            this.displayControlEditBool = this.event3D.value;
            break;
          case 'showControls':
            this.displayControlsBool = this.event3D.value;
            break;
          case 'selectAxes':
            this.selectAxesBool = this.event3D.value;
            break;
          case 'selectGlassInfo':
            this.selectGridIdBool = this.event3D.value;
            this.configureService.setInfoButtonDisplay(this.selectGridIdBool);
            break;
          case 'selectGrid':
            this.selectGridBool = this.event3D.value;
            break;
          case 'changeUnifiedModel':
            this.loadingCopyDelete = false;
            break;
          case 'selectSpliceJoint':
            {
              //this.disableControlDeleteBool = !this.ifService.isAllowedToDelete(this.unified3DModel, this.event3D.value.selectedSlabAnchorIDs);
            }
            break;
          case 'selectSlabAnchor':
            {
              this.disableControlDeleteBool = !this.ifService.isAllowedToDelete(this.unified3DModel, this.event3D.value.selectedSlabAnchorIDs);
            }
            break;
          case 'SelectedDoorGlass':
            {
              this.disableMullionAndTransom = this.event3D.value;
            }
            break;
          case 'IncorrectLargeDimension':
            {
              this.isCheckoutDisableInvalLargeDim = this.event3D.value.active;
              if (this.isCheckoutDisableInvalLargeDim) {
                this.ngNotificaionShow.next({ title: 'Dimensions limit', message: 'The maximum width and height for this product are W'+ ' ' + this.event3D.value.width + ' mm x H'+ ' ' + this.event3D.value.height + ' mm.', logoToShow: 'Warning' });
              }
              this.cpService.setCheckoutDisable_InvalidLargeDimension(this.isCheckoutDisableInvalLargeDim);
            }
            break;
          case 'IncorrectSmallDimension':
            {
              this.isCheckoutDisableInvalSmallDim = this.event3D.value.active;
              if (this.isCheckoutDisableInvalSmallDim) {
                this.ngNotificaionShow.next({ title: 'Dimensions limit', message: 'The minimum width and height for this product are W'+ ' ' + this.event3D.value.width + ' mm x H'+ ' ' + this.event3D.value.height + ' mm.', logoToShow: 'Warning' });
              }
              this.cpService.setCheckoutDisable_InvalidSmallDimension(this.isCheckoutDisableInvalSmallDim);
            }
            break;
          case 'changeOutside':
            {
              if(this.event3D.value) {
                this.selectOutsideBool = true;
                this.selectInsideBool = false;
              } else {
                this.selectInsideBool = true;
                this.selectOutsideBool = false;
              }
            }
            break; 
        }
      }

      if (Changes.problem) {
        this.dateLastModified = this.ifService.getLastModifiedDate(this.problem.ModifiedOn);
      }
    }
  }

  // get the iframe of interest
  getIFrame() {
    if (typeof this.IFrame === 'undefined' || this.IFrame === null) {
      this.IFrame = document.getElementById(this.ExchangeId) as HTMLIFrameElement;
    }
    return this.IFrame;
  }

  // method that messages the iframe
  postMessage(event: IFrameEvent) {
    let iFrame = this.getIFrame();
    if (typeof iFrame !== 'undefined' && iFrame !== null && iFrame.contentWindow !== null) {
      let window = (iFrame.contentWindow as Window);
      window.postMessage(
        new IFrameExchangeData(this.ExchangeId, event),
        '*'
      );
    }
  }

  // listen to any message events from the iframe (but as per good practice we are listening on the window)
  @HostListener('window:message', ['$event'])
  onMessage(ev: MessageEvent) {
    // only listen to our iframe, events from which will have the right exchangeId
    if (ev.data.exchangeId !== this.ExchangeId) { return; }
    let data = ev.data as IFrameExchangeData;
    // message the parent component
    this.ChildEvents.emit(data.event as IFrameEvent);
    this.ifService.setChildEvent(data.event as IFrameEvent);
  }

 /**
 * This function is used to call the output event Loaded with boolean value true 
 * inorder to display teh loader until and unless all the data has loaded
 */
  onIframeLoad(exchangeId: string) {
    if (exchangeId === this.ExchangeId) {
      // this will trigger the Loaded event on the parent component
      this.Loaded.emit(true);
    }
  }

 /**
 * This function is used to open the structural table which is calling the structural component method called onOpenTable()
 * 
 */
  onOpenStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.onOpenTable();
    }
  }

  sendPressureValue(event) {
    this.sendPressureValueEvent.emit(event);
  }

 /**
 * This function is used to close the mullion depth table which is calling the mullion depth component method called onCloseLeftPopout()
 * 
 */
  closeFramingPopouts() {
    if (this.mullionDepthTable) {
      this.mullionDepthTable.onCloseLeftPopout();
    }
  }

 /**
 * This function is used to close the spacer type table which is calling the spacer type component method called onClose()
 * 
 */
  onCloseSpacerTypePopout() {
    if (this.spacerType) {
      this.spacerType.onClose();
    }
  }

 /**
 * This function is used to add the custom library for the framing component .
 * 
 * Based on the custom framing variable openNewCustom method of customFraming component is called to add custom framing data.
 *
 */
  openNewCustom() {
    if (this.customFraming) {
      this.customFraming.openNewCustom();
    }
  }

 /**
 * This function is used to edit the custom library for the framing component .
 *
 * @param {any} data is the custom article added by User for framing
 * 
 * the article is passed to the editCustomArticle Method of custom framing component
 *
 */
  editCustomArticle(data) {
    if (this.customFraming) {
      this.customFraming.editCustomArticle(data);
    }
  }

 /**
 * This function is used to edit the custom library for the framing component .
 *
 * @param {any} data is the custom article added by User for framing
 * 
 * the article is passed to the editCustomArticle Method of custom framing component
 *
 */
  editCustomLibraryArticle(data) {
    if (this.customFraming) {
      this.customFraming.editCustomArticle(data);
    }
  }

 /**
 * This function is used to add the custom library for the glass and Panel component .
 *
 * @param {any} article is the custom article added by User for Glass and panel component
 * 
 * the article is passed to the openNewCustom Method of custom library component
 *
 */
  openNewLibraryCustom(article: any) {
    if (this.customLibrary) {
      this.customLibrary.openNewCustom(article);
    }
  }

 /**
 * This function is used to delete mullion or transom data in the mullion depth table.
 *
 * @param {number} articleIndex is the index of article data which has been selected by user is passed to the deleteArticle method of Mullion table component if product type is Window
 * 
 * If product type is UDC and the selected index of  intermediate mullion  object is passed to deleteIntermediateMullionArticle method of Mullion Depth component
 * 
 * If Product type is UDC and the selected index of  transom object is passed to deleteIntermediateTransomArticle method of Mullion Depth Component
 * 
 */
  deleteMullionTransomArticle(articleIndex) {
    if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
      if (this.mullionDepthTable.isIntermediateMullionPopoutOpened) {
        this.mullionDepthTable.deleteIntermediateMullionArticle(articleIndex);
      }
      else if (this.mullionDepthTable.isIntermediateTransomPopoutOpened) {
        this.mullionDepthTable.deleteIntermediateTransomArticle(articleIndex);
      }
      else if (this.mullionDepthTable.isUDCFramingPopoutOpened) {
        this.mullionDepthTable.deleteUDCFramingArticle(articleIndex);
      }
    }
    else {
      if (this.mullionTable)
        this.mullionTable.deleteArticle(articleIndex);
    }

  }

 /**
 * This function is used to add mullion or transom data in the mullion depth table.
 *
 * @param {any} sectionElement is the mullion or transom data object which has been added by user is passed to the addMullionTransomArticle method of Mullion table component if product type is Window
 * 
 * If product type is UDC and the added intermediate mullion  object is passed to addIntermediateMullionArticle method of Mullion Depth component
 * 
 * If Product type is UDC and the added transom object is passed to addIntermediateTransomArticle method of Mullion Depth Component
 * 
 */
  addMullionTransomArticle(sectionElement) {
    if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
      if (this.mullionDepthTable.isIntermediateMullionPopoutOpened) {
        this.mullionDepthTable.addIntermediateMullionArticle(sectionElement);
      }
      else if (this.mullionDepthTable.isIntermediateTransomPopoutOpened) {
        this.mullionDepthTable.addIntermediateTransomArticle(sectionElement);
      }
      else if (this.mullionDepthTable.isUDCFramingPopoutOpened) {
        this.mullionDepthTable.addUDCFramingArticle(sectionElement);
      }
    }
    else {
      if (this.mullionTable)
        this.mullionTable.addMullionTransomArticle(sectionElement);
    }
  }

 /**
 * This function is used to update mullion or transom data in the mullion depth table.
 *
 * @param {any} data is the mullion or transom data object which has been modified by user is passed to the updateMullionTransomArticle method of Mullion table component if product type is Window
 * 
 * If product type is UDC and the modified intermediate mullion  object is passed to updateIntermediateMullionArticle method of Mullion Depth component
 * 
 * If Product type is UDC and the modified transom object is passed to updateIntermediateTransomArticle method of Mullion Depth Component
 * 
 */
  updateMullionTransomArticle(data) {
    if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
      if (this.mullionDepthTable.isIntermediateMullionPopoutOpened) {
        this.mullionDepthTable.updateIntermediateMullionArticle(data);
      }
      else if (this.mullionDepthTable.isIntermediateTransomPopoutOpened) {
        this.mullionDepthTable.updateIntermediateTransomArticle(data);
      }
      else if (this.mullionDepthTable.isUDCFramingPopoutOpened) {
        this.mullionDepthTable.updateUDCFramingArticle(data);
      }
    }
    else {
      if (this.mullionTable)
        this.mullionTable.updateMullionTransomArticle(data);
    }
  }

 /**
 * This function is used to delete the custom library data by the index in  glass and panel component.
 *
 * @param {number} articleIndex is the custom library object index which is selected to be delete from glass and panel component
 */
  deleteLibraryCustomArticle(articleIndex) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.deleteLibraryCustomArticle(articleIndex);
    }
  }

 /**
 * This function is used to add the custom library data when user adds it to the glass and panel component.
 *
 * @param {any} data is the custom library object which is added by the user is passed to the updateLibraryCustomArticle method of glass and panel component
 */
  addLibraryCustomArticle(sectionElement) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.addLibraryCustomArticle(sectionElement);
    }
  }

 /**
 * This function is used to update the custom library data in the glass and panel component.
 *
 * @param {any} data is the custom library object which is modified by the user is passed to the updateLibraryCustomArticle method of glass and panel component
 */
  updateLibraryCustomArticle(data) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.updateLibraryCustomArticle(data);
    }
  }

  //#region IFrameEvent

 /**
 * This function is used to call the event in the 3D Model to edit the model in the 3D Viewer.
 *
 */
  onCrontrolEdit() {
    this.iframeEvent.next(new IFrameEvent('clickControlEdit'));
    setTimeout(() => {
      if (this.activePanel && this.activePanel.operability) {
        this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: this.ifService.getDisplaySettings_Operability(this.unified3DModel) }));
      }
      if (this.activePanel && this.activePanel.glassNpanel) {
        this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: this.ifService.getDisplaySettings_GlassPanel(this.unified3DModel, this.activePanel) }));
      }
      if (this.activePanel && this.activePanel.slidingUnit) {
        this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: this.ifService.getDisplaySettings_SlidingUnit(this.unified3DModel) }));
      }
    });
  }

 /**
 * This function is used to call the event in the 3D Model to add the transom to the selected glass
 *
 */
  onAddTransom() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickAddTransom'));
    }
  }

 /**
 * This function is used to call the event in the 3D Model to add the mullion to the selected glass
 *
 */
  onAddMullion() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickAddMullion'));
    }
  }

 /**
 * This function is used to call the event in the 3D Model to delete the selected mullion or transom
 *
 */
  onDelete() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickDelete'));
    }
  }

 /**
 * This function is used to call the event in the 3D Model to display the axes button in the viewer
 * 
 * boolean value is passed to the event inorder to display the axes in the viewer  if it is true
 *
 */
  onClickAxes() {
    this.iframeEvent.next(new IFrameEvent('clickAxes', { isSelected: this.selectAxesBool }));
  }

 /**
 * This function is used to call the event in the 3D Model to distribute the Major mullions equally
 * 
 */
  onClickDistributeEqually() {
    if (this.selectedMajorMullionIDs.length > 0)
      this.iframeEvent.next(new IFrameEvent('clickDistributeFacadeMajorMullionsEqually'));
  }

 /**
 * This function is used to call the event in the 3D Model to display the copy to top button in the viewer
 * 
 * boolean value is passed to the event inorder to display the copy to top button and also will copy to right if it is true
 *
 * @param {boolean} isCopy if it is true will call the event click copy to Top else will call the event Click delete facade top most row 
 */
  onClickCopyToTop(isCopy: boolean) {
    this.loadingCopyDelete = true;
    if (isCopy)
      this.iframeEvent.next(new IFrameEvent('clickCopyToTop'));
    else
      this.iframeEvent.next(new IFrameEvent('clickDeleteFacadeTopMostRow'));
  }

 /**
 * This function is used to call the event in the 3D Model to display the copy to right button in the viewer
 * 
 * boolean value is passed to the event inorder to display the copy to right button and also will cpy to right if it is true
 * 
 */
  onClickCopyToRight(isCopy: boolean) {
    this.loadingCopyDelete = true;
    if (isCopy)
      this.iframeEvent.next(new IFrameEvent('clickCopyToRight'));
    else
      this.iframeEvent.next(new IFrameEvent('clickDeleteFacadeRightMostColumn'));
  }
  onClickCopyToLeft() {
    //this.iframeEvent.next(new IFrameEvent('clickCopyToLeft'));
  }
  onClickCopyToBottom() {
    //this.iframeEvent.next(new IFrameEvent('clickCopyToBottom'));
  }

 /**
 * This function is used to call the event in the 3D Model to display the glass info in the viewer
 * 
 * boolean value is passed to the event inorder to display the glass info or not and also 
 * 
 * to keep the button in selected state or not in the 3D viewer
 */
  onClickGlassInfo() {
    this.iframeEvent.next(new IFrameEvent('clickGlassInfo', { isSelected: this.selectGridIdBool }));
  }

 /**
 * This function is used to call the event in the 3D Model to display the grid in the viewer
 * 
 * boolean value is passed to the event inorder to display the grid or not and also 
 * 
 * to keep the button in selected state or not in the 3D viewer
 */
  onClickGrid() {
    this.iframeEvent.next(new IFrameEvent('clickGrid', { isSelected: this.selectGridBool }));
  }

  //#endregion IFrameEvent

 /**
 * This function is used to set the variable to display the copy button in the 3D Viewer
 * 
 */
  onShowCopy() {
    if (!this.displayCopyControlsBool && this.configureService.rightPanelOpened)
      this.configureService.changeRightPanelDisplay();
    this.displayCopyControlsBool = !this.displayCopyControlsBool;
  }

 /**
 * This function is used to send the object selected to the spacer type component to display the article as selected in the table 
 * 
 * @param {any} event is the spacer article object which is in the spacer type table and will be displayed as selected
 */
  getSpacerTypeByKey(event) {
    if (this.spacerType) {
      this.spacerType.getSpacerTypeByKey(event);
    }
  }

 /**
 * This function is used to make the axesHelper, glassId, controlGrid buttons blur in the 3D Viewer 
 * 
 */
  onFocus() {
    if (this.axesHelperButton) {
      this.axesHelperButton.elementRef.nativeElement.blur();
    }
    if (this.glassIdButton) {
      this.glassIdButton.elementRef.nativeElement.blur();
    }
    if (this.controlsGridButton) {
      this.controlsGridButton.elementRef.nativeElement.blur();
    }
  }

 /**
 * This function is used to close the structural table which is calling the structural table component method oncloseTable()
 * 
 */
  onCloseStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.onCloseTable();
    }
  }

 /**
 * This function is used to clear the structural table which is calling the structural table component method clear table
 * 
 */
  clearStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.clearTable();
    }
  }

 /**
 * This function is used to send the article to the glass panel component to display the article as selected in the table 
 * 
 * @param {any} article is the glass article object which is in the glass table and will be displayed as selected
 */
  selectRowInGlassNPanel(article) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.selectRow(article);
    }
  }

 /**
 * This function calls when checkout button is clicked from the 3D Viewer
 * 
 * It will redirect to the orders page where user can place the order
 */
  onCheckout() {
    let infills = this.unified3DModel.ModelInput.Geometry.Infills.filter(g => g.OperabilitySystemID > 0);
    if (this.permissionService.checkPermission(Feature.Max4VentsAllowed) && (this.selectedGlassIDs.length > 4 || infills.length > 4)) {
      setTimeout(() => {
        this.notification.WarningNotification('Maximum 4 Vents per Product', 'The model support only 4 vents, please adjust the model accordingly before \"go to checkout\".', 0, 'topLeft', '0px');
      }, 200);
      
    } else {
      this.isCheckoutClicked.emit(true);
    }
  }
}
