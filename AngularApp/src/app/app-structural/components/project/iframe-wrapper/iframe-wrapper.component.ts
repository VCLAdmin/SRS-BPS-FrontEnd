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

      this.umService.obsUnifiedProblem.pipe(takeUntil(this.destroy$)).subscribe(response => {
        if (response) {
          this.isCheckoutDisableInvalLargeDim = false;
          this.isCheckoutDisableInvalSmallDim = false;
        }
      });
      /*this.collectDataAfterProductChange();*/
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

  onClickOutside() {
    this.selectOutsideBool = true;
    this.selectInsideBool = false;
    this.iframeEvent.next(new IFrameEvent('setOutsidePosition'));
  }
  onClickInside() {
    this.selectInsideBool = true;
    this.selectOutsideBool = false;
    this.iframeEvent.next(new IFrameEvent('setInsidePosition'));
  }

  CalculateSubTotalCost() {
    let subTotal = this.ifService.CalculateSubTotalCost(this.unified3DModel);
    this.calculatedSubTotal = subTotal? subTotal:0;
    this.configureService.subTotalFromIframeSubject.next(this.calculatedSubTotal);
    if (this.unified3DModel.SRSProblemSetting !== undefined && this.unified3DModel.SRSProblemSetting !== null)
      this.unified3DModel.SRSProblemSetting.SubTotal = subTotal;
    this.subTotalEvent.emit(subTotal);
  }

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

    this.cpService.obsCheckoutDisable_InvalidLargeDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalLargeDim = response;
      });
    this.cpService.obsCheckoutDisable_InvalidSmallDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalSmallDim = response;
      });
  
  }

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

  onIframeLoad(exchangeId: string) {
    if (exchangeId === this.ExchangeId) {
      // this will trigger the Loaded event on the parent component
      this.Loaded.emit(true);
    }
  }

  onOpenStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.onOpenTable();
    }
  }

  sendPressureValue(event) {
    this.sendPressureValueEvent.emit(event);
  }

  closeFramingPopouts() {
    if (this.mullionDepthTable) {
      this.mullionDepthTable.onCloseLeftPopout();
    }
  }
  onCloseSpacerTypePopout() {
    if (this.spacerType) {
      this.spacerType.onClose();
    }
  }

  openNewCustom() {
    if (this.customFraming) {
      this.customFraming.openNewCustom();
    }
  }
  editCustomArticle(data) {
    if (this.customFraming) {
      this.customFraming.editCustomArticle(data);
    }
  }
  editCustomLibraryArticle(data) {
    if (this.customFraming) {
      this.customFraming.editCustomArticle(data);
    }
  }
  openNewLibraryCustom(article: any) {
    if (this.customLibrary) {
      this.customLibrary.openNewCustom(article);
    }
  }

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


  deleteLibraryCustomArticle(articleIndex) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.deleteLibraryCustomArticle(articleIndex);
    }
  }

  addLibraryCustomArticle(sectionElement) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.addLibraryCustomArticle(sectionElement);
    }
  }

  updateLibraryCustomArticle(data) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.updateLibraryCustomArticle(data);
    }
  }

  //#region IFrameEvent

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

  onAddTransom() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickAddTransom'));
    }
  }

  onAddMullion() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickAddMullion'));
    }
  }

  onDelete() {
    if (this.canBeDrawnBool) {
      this.iframeEvent.next(new IFrameEvent('clickDelete'));
    }
  }

  onClickAxes() {
    this.iframeEvent.next(new IFrameEvent('clickAxes', { isSelected: this.selectAxesBool }));
  }

  onClickDistributeEqually() {
    if (this.selectedMajorMullionIDs.length > 0)
      this.iframeEvent.next(new IFrameEvent('clickDistributeFacadeMajorMullionsEqually'));
  }

  onClickCopyToTop(isCopy: boolean) {
    this.loadingCopyDelete = true;
    if (isCopy)
      this.iframeEvent.next(new IFrameEvent('clickCopyToTop'));
    else
      this.iframeEvent.next(new IFrameEvent('clickDeleteFacadeTopMostRow'));
  }
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

  onClickGlassInfo() {
    this.iframeEvent.next(new IFrameEvent('clickGlassInfo', { isSelected: this.selectGridIdBool }));
  }

  onClickGrid() {
    this.iframeEvent.next(new IFrameEvent('clickGrid', { isSelected: this.selectGridBool }));
  }

  //#endregion IFrameEvent

  onShowCopy() {
    if (!this.displayCopyControlsBool && this.configureService.rightPanelOpened)
      this.configureService.changeRightPanelDisplay();
    this.displayCopyControlsBool = !this.displayCopyControlsBool;
  }
  getSpacerTypeByKey(event) {
    if (this.spacerType) {
      this.spacerType.getSpacerTypeByKey(event);
    }
  }

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

  onCloseStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.onCloseTable();
    }
  }

  clearStructuralTable() {
    if (this.structuralTableComponent) {
      this.structuralTableComponent.clearTable();
    }
  }

  selectRowInGlassNPanel(article) {
    if (this.glassPanelTableComponent) {
      this.glassPanelTableComponent.selectRow(article);
    }
  }

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
