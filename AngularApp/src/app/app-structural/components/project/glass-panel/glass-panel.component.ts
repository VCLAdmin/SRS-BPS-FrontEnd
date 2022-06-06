import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ThrowStmt } from '@angular/compiler';
import { GlazingSystem, Plate, Cavity, BpsUnifiedModel, PanelSystem } from 'src/app/app-common/models/bps-unified-model';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeftConfigureComponent } from '../left-configure/left-configure.component';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-glass-panel',
  templateUrl: './glass-panel.component.html',
  styleUrls: ['./glass-panel.component.css']
})
export class GlassPanelComponent implements OnInit, OnChanges, OnDestroy {
  isGlassPanelTableOpened: boolean;

  confirmedGlassPanelArticle = null;
  @Input() event3D: any;
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() iframeEvent: any;
  @Input() canBeDrawnBool: boolean;
  @Input() getSpacerTypeByKeyEvent: EventEmitter<any>;
  @Input() openCloseGlassPanelTableEvent: EventEmitter<any>;
  @Input() spacerTypeArticle: any;
  @Output() unified3DModelFromGlassPanelEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter<BpsUnifiedModel>();
  @Output() sendValidationBoolToParentEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();
  elementsSize = [[], [], [], [], []];
  elementsType = [[], [], [], [], []];
  pvbValue = [[], [], [], [], []];
  pvbValueFull = [[], [], [], [], []];
  glassDescription: string;
  pickers = [
    { idPicker: 0, populated: false, article: { idArticle: 0, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
    { idPicker: 1, populated: false, article: { idArticle: 1, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
    { idPicker: 2, populated: false, article: { idArticle: 2, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
    { idPicker: 3, populated: false, article: { idArticle: 3, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
    { idPicker: 4, populated: false, article: { idArticle: 4, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] }
  ];
  panelList: any[];
  doubleData: any;
  tripleData: any;
  customLibraryData: any;
  spacerTypeModelInputArray = ['1', '1', '1', '1', '1'];   // key value of spacer type
  spacerTypeDisplayInPanel = ['', '', '', '', ''];        // string name of spacer type
  isSidePanel = true;
  // elementsSize = [[],[],[]];
  // elementsType = [[],[],[]];
  // pickers = [
  //   {populated: false, article: { composition: "4-16-4", type: "glass-air-glass", totalThickness: 24, totalThicknessUnit:"mm", uvalue: "1.1", rw: 31, spacer: "0" }, glassId_added: []},
  //   {populated: false, article: { composition: "4-16-4", type: "glass-air-glass", totalThickness: 24, totalThicknessUnit:"mm", uvalue: "1.1", rw: 31, spacer: "0" }, glassId_added: []},
  //   {populated: false, article: { composition: "4-16-4", type: "glass-air-glass", totalThickness: 24, totalThicknessUnit:"mm", uvalue: "1.1", rw: 31, spacer: "0" }, glassId_added: []}
  // ];
  // spacerTypeModelInputArray = ['1','1','1'];
  // spacerTypeDisplayInPanel = ['','',''];

  isSpacerTypeOpened: boolean = false;
  selectedPicker: number = -1;
  selectedPickerString: string = "-1";
  selectedGlassId_array: any = [];
  bpsListTypeVariation: string;
  glassIDsAlreadyApplied = {};
  language: string = '';
  isPSIValid: boolean = true;
  validatePSIForm: FormGroup;
  psiValueNumber: number;
  validateBlockDistanceForm: FormGroup;
  blockDistanceNumber: number;
  applicationType: string;

  @Input() orderPlaced: boolean;
  feature = Feature;
  private destroy$ = new Subject<void>();
  constructor(private umService: UnifiedModelService, private cpService: ConfigPanelsService, private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private iframeService: IframeService,
    private configureService: ConfigureService,
    private translate: TranslateService,
    private lc: LeftConfigureComponent,
    private permissionService: PermissionService) {
    this.applicationType = this.configureService.applicationType;
    this.validateBlockDistanceForm = this.fb.group({
      blockDistance: ['', [Validators.required, Validators.max(250), Validators.min(70)]]
    });
    this.validatePSIForm = this.fb.group({
      psiValue: ['0.13', [Validators.required]],
    });
    this.applicationType = this.configureService.applicationType;
  }



  ngAfterViewInit(): void {
    this.cpService.obsConfirm.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.GlassPanel) {
          this.confirmedGlassPanelArticle = response.data;
          this.onGlassPanelConfirm();
        }
      });
    
   this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.GlassPanel) this.isGlassPanelTableOpened = response.isOpened;
        if (response.panelsModule === PanelsModule.SpacerType) this.isSpacerTypeOpened = response.isOpened;
      });

  }

  ngOnInit(): void {
    if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableShort)) {
      this.doubleData = this.configureService.getArticleListByType("double_SRS");
      this.tripleData = this.configureService.getArticleListByType("triple_SRS");
    } else if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableFull)) {
      this.doubleData = this.configureService.getArticleListByType("double_BPS");
      this.tripleData = this.configureService.getArticleListByType("triple_BPS");
      this.panelList = this.configureService.getArticleListByType("panel_BPS");
    }
    this.loadGlassnPanel();
    
   
  }
  reloadToDefault() {
    this.elementsSize = [[], [], [], [], []];
    this.elementsType = [[], [], [], [], []];
    this.pvbValue = [[], [], [], [], []];
    this.pvbValueFull = [[], [], [], [], []];
    this.pickers = [
      { idPicker: 0, populated: false, article: { idArticle: 0, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
      { idPicker: 1, populated: false, article: { idArticle: 1, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
      { idPicker: 2, populated: false, article: { idArticle: 2, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
      { idPicker: 3, populated: false, article: { idArticle: 3, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] },
      { idPicker: 4, populated: false, article: { idArticle: 4, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction:null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double'}, shgc: 0, vt:0, stc: 0, oitc: 0 , blockDistance: 100, glassId_added: [] }
    ];
    this.panelList = [];
    this.spacerTypeModelInputArray = ['1', '1', '1', '1', '1'];   // key value of spacer type
    this.spacerTypeDisplayInPanel = ['', '', '', '', ''];        // string name of spacer type
    this.isSidePanel = true;
  }
  loadGlassnPanel() {
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems)
      this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(f => f.Description == '1/4 Clear+1/2 ARGON+1/4 Clear (1 in)').map(x => { x.Description = "1/4 Clear SB 60+1/2 ARGON+1/4 Clear (1 in)"; return x });
    this.language = this.configureService.getLanguage();
    let value = "1.1";   // UValue
    let uvalueByCulture = value ? (this.language === "DE" || this.language === "de-DE" ? value.replace('.', ',') : value) : value;
    this.confirmedGlassPanelArticle = { composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 31, spacer: "0" };
    //this.cpService.setConfirm(this.confirmedGlassPanelArticle, PanelsModule.GlassPanel);
    this.glassIDsAlreadyApplied = {};
    this.pickers.forEach(picker => {
      picker.glassId_added = [];
    });
    this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
      if (glass.GlazingSystemID > 0) {
        this.pickers[glass.GlazingSystemID - 1].glassId_added.push(glass.InfillID);
        this.glassIDsAlreadyApplied[glass.InfillID] = glass.GlazingSystemID - 1;
        // this.validateBlockDistanceForm.controls['blockDistance'].setValue(glass.BlockDistance);
        // this.blockDistanceNumber = glass.BlockDistance;
        this.pickers[glass.GlazingSystemID - 1].blockDistance = glass.BlockDistance;
      }
      else if (glass.PanelSystemID > 0) {
        this.pickers[glass.PanelSystemID - 1].glassId_added.push(glass.InfillID);
        this.glassIDsAlreadyApplied[glass.InfillID] = glass.PanelSystemID - 1;
        // this.validateBlockDistanceForm.controls['blockDistance'].setValue(glass.BlockDistance);
        // this.blockDistanceNumber = glass.BlockDistance;
        this.pickers[glass.PanelSystemID - 1].blockDistance = glass.BlockDistance;
      }
    });
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems === undefined || this.unified3DModel.ModelInput.Geometry.GlazingSystems === null)
      this.unified3DModel.ModelInput.Geometry.GlazingSystems = [];     
    this.unified3DModel.ModelInput.Geometry.GlazingSystems.forEach(glazingSystem => {
      //!this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault && 
      if (glazingSystem.GlazingSystemID > 0) {
        this.pickers.forEach((picker, index) => {
          if (index <= glazingSystem.GlazingSystemID - 1) {
            picker.populated = true;
          }
        });
        let article: any = {};
        this.pvbValue[glazingSystem.GlazingSystemID - 1] = ["", "", "", "", ""];
        this.pvbValueFull[glazingSystem.GlazingSystemID - 1] = ["", "", "", "", ""];

        //article['composition'] = glazingSystem.Description.split(' ')[0].replace(/\//g,'-');
        let arr =[];
        let description = [];
        if(this.configureService.applicationType == "SRS"){
          glazingSystem.Description.split('+').forEach((text)=>{
            let dimension = text.split(' ');
            if(dimension && dimension.length>0){
              description.push(dimension[0].split('[')[0]);
            }
          });
        } else{
          arr = glazingSystem.Description.split(' ')[0].split('/');
          arr.forEach(element => {
            description.push(element.split('[')[0]);
          });
        }
        
        article['composition'] = description.join('-');
        let compositions = article['composition'].split('-');
        article['type'] = '';
        for (let i = 0; i < glazingSystem.Cavities.length + glazingSystem.Plates.length; i++) {
          let pvbVal = "", pvbValByCulture = "";
          if (glazingSystem.Plates && glazingSystem.Plates[i] && glazingSystem.Plates[i].InterH > 0) {
            compositions[i * 2] = compositions[i * 2] + "(" + glazingSystem.Plates[i].InterH + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)";
            pvbVal = glazingSystem.Plates[i].InterH.toString();
            pvbValByCulture = pvbVal ? (this.language === "DE" || this.language === "de-DE" ? pvbVal.toString().replace('.', ',') : pvbVal) : pvbVal;

            if (i * 2 <= compositions.length) {
              this.pvbValue[glazingSystem.GlazingSystemID - 1][i * 2] = pvbVal;
              this.pvbValueFull[glazingSystem.GlazingSystemID - 1][i * 2] = pvbValByCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB";
            }
          }
          switch (i % 2) {
            case 0: // Plates
              if (glazingSystem.Plates[Math.floor(i / 2)].Material == "lamiAcousticPVB")
                article['type'] = article['type'] + this.translate.instant(_('result.glass'));
              else
                article['type'] = article['type'] + glazingSystem.Plates[Math.floor(i / 2)].Material;

              break;
            case 1: // Cavities
              article['type'] = article['type'] + '-' + glazingSystem.Cavities[Math.floor(i / 2)].CavityType + '-';
              break;
          }
        }
        if(this.configureService.applicationType == "SRS"){
          let desc = glazingSystem.Description.split(' (')
          if(desc && desc.length > 0){
            let text = desc[0].split('+');
            this.glassDescription = text.join('-');
          }
        }
        this.pickers[glazingSystem.GlazingSystemID - 1].shgc = glazingSystem.SHGC;
        this.pickers[glazingSystem.GlazingSystemID - 1].vt = glazingSystem.VT;
        this.pickers[glazingSystem.GlazingSystemID - 1].oitc = glazingSystem.OITC;
        this.pickers[glazingSystem.GlazingSystemID - 1].stc = glazingSystem.STC;
        article['totalThickness'] = article.composition.split('-').reduce(function (a, b) { return parseInt(a) + parseInt(b); }, 0);
        article['totalThicknessUnit'] = this.configureService.applicationType == "SRS"? 'in':'mm';
        article['uvalue'] = glazingSystem.UValue;
        article['rw'] = glazingSystem.Rw;
        article['spacer'] = glazingSystem.SpacerType;
        article['category'] = glazingSystem.Category;
        this.spacerTypeModelInputArray[glazingSystem.GlazingSystemID - 1] = glazingSystem.SpacerType.toString();
        if (this.configureService.applicationType == "SRS") {
          let articleData = this.doubleData.filter(f => f.composition == this.glassDescription);
          if (articleData.length === 0)
            articleData = this.tripleData.filter(f => f.composition == this.glassDescription);
          this.pickers[glazingSystem.GlazingSystemID - 1].article = articleData[0];
        } else {
          this.pickers[glazingSystem.GlazingSystemID - 1].article = article;
        }
        if(this.configureService.applicationType == "SRS" && this.pickers[glazingSystem.GlazingSystemID - 1].article && this.pickers[glazingSystem.GlazingSystemID - 1].article.uvalue){
          this.pickers[glazingSystem.GlazingSystemID - 1].article.uvalueBTU = (parseFloat(this.pickers[glazingSystem.GlazingSystemID - 1].article.uvalue)/5.68).toFixed(3);
        }
        if (this.pickers[glazingSystem.GlazingSystemID - 1].article) {
          this.pickers[glazingSystem.GlazingSystemID - 1].article.idArticle = this.pickers[glazingSystem.GlazingSystemID - 1].idPicker;
        }
        this.elementsSize[glazingSystem.GlazingSystemID - 1] = article.composition.split('-');
        this.elementsType[glazingSystem.GlazingSystemID - 1] = this.pickers[glazingSystem.GlazingSystemID - 1].article.type.split('-');
        this.changeTypeToUpperCase(glazingSystem.GlazingSystemID - 1);  // change first letter to uppercase
        //if(!this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault)
        this.selectedPicker = glazingSystem.GlazingSystemID - 1;
        this.selectedPickerString = this.selectedPicker.toString();
        if (this.selectedPicker !== -1) {
          this.blockDistanceNumber = this.pickers[this.selectedPicker].blockDistance;
          this.validateBlockDistanceForm.controls['blockDistance'].setValue(this.blockDistanceNumber);
        }
        this.bpsListTypeVariation = "variation" + (this.selectedPicker + 1).toString();   // update the variation of the list
        article['composition'] = compositions.join('-');
      }
    });
    if (this.unified3DModel.ModelInput.Geometry.PanelSystems === undefined || this.unified3DModel.ModelInput.Geometry.PanelSystems === null)
      this.unified3DModel.ModelInput.Geometry.PanelSystems = [];
    this.unified3DModel.ModelInput.Geometry.PanelSystems.forEach(glazingSystem => {
      //!this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault && 
      if (glazingSystem.PanelSystemID > 0) {
        this.pickers.forEach((picker, index) => {
          if (index <= glazingSystem.PanelSystemID - 1) {
            picker.populated = true;
          }
        });
        let article: any = {};
        this.pvbValue[glazingSystem.PanelSystemID - 1] = ["", "", "", "", ""];
        this.pvbValueFull[glazingSystem.PanelSystemID - 1] = ["", "", "", "", ""];

        //article['composition'] = glazingSystem.Description.split(' ')[0].replace(/\//g,'-');
        let arr = [];
        let description = [];
        this.configureService.applicationType == "SRS"? glazingSystem.Description.split(' ')[0].split('+'): glazingSystem.Description.split(' ')[0].split('/');
        if(this.configureService.applicationType == "SRS"){
          glazingSystem.Description.split('+').forEach((text)=>{
            let dimension = text.split(' ');
            if(dimension && dimension.length>0){
              description.push(dimension[0].split('[')[0]);
            }
          });
        } else{
          arr = glazingSystem.Description.split(' ')[0].split('/');
          arr.forEach(element => {
            description.push(element.split('[')[0]);
          });
        }

        article['composition'] = description.join('-');
        let compositions = article['composition'].split('-');
        article['type'] = '';
        for (let i = 0; i < glazingSystem.Cavities.length + glazingSystem.Plates.length; i++) {
          let pvbVal = "", pvbValByCulture = "";
          if (glazingSystem.Plates && glazingSystem.Plates[i] && glazingSystem.Plates[i].InterH > 0) {
            compositions[i * 2] = compositions[i * 2] + "(" + glazingSystem.Plates[i].InterH + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)";
            pvbVal = glazingSystem.Plates[i].InterH.toString();
            pvbValByCulture = pvbVal ? (this.language === "DE" || this.language === "de-DE" ? pvbVal.toString().replace('.', ',') : pvbVal) : pvbVal;

            if (i * 2 <= compositions.length) {
              this.pvbValue[glazingSystem.PanelSystemID - 1][i * 2] = pvbVal;
              this.pvbValueFull[glazingSystem.PanelSystemID - 1][i * 2] = pvbValByCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB";
            }
          }
          if (i < 3)
            if (glazingSystem.Plates[i].Material == "lamiAcousticPVB")
              article['type'] = article['type'] + this.translate.instant(_('result.glass'));
            else {
              if (i === 1 && glazingSystem.Cavities.length > 0) {
                article['type'] = article['type'] + '-' + glazingSystem.Cavities[0].CavityType;
              }
              article['type'] = article['type'] === '' ? glazingSystem.Plates[i].Material : article['type'] + '-' + glazingSystem.Plates[i].Material;
            }
        }

        article['totalThickness'] = article.composition.split('-').reduce(function (a, b) { return parseInt(a) + parseInt(b); }, 0);
        article['totalThicknessUnit'] = this.configureService.applicationType == "SRS"? 'in':'mm';;
        article['uvalue'] = glazingSystem.UValue;
        article['rw'] = glazingSystem.Rw;
        //article['spacer'] = glazingSystem.SpacerType;
        article['category'] = 'panel';
        article['psiValue'] = glazingSystem.Psi;
        this.psiValueNumber = glazingSystem.Psi;
        //this.spacerTypeModelInputArray[glazingSystem.PanelSystemID - 1] = glazingSystem.SpacerType.toString();
        this.pickers[glazingSystem.PanelSystemID - 1].article = article;
        this.pickers[glazingSystem.PanelSystemID - 1].article.idArticle = this.pickers[glazingSystem.PanelSystemID - 1].idPicker;
        this.elementsSize[glazingSystem.PanelSystemID - 1] = article.composition.split('-');
        this.elementsType[glazingSystem.PanelSystemID - 1] = article.type.split('-');
        this.changeTypeToUpperCase(glazingSystem.PanelSystemID - 1);  // change first letter to uppercase
        //if(!this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault)
        this.selectedPicker = glazingSystem.PanelSystemID - 1;
        this.selectedPickerString = this.selectedPicker.toString();
        if (this.selectedPicker !== -1) {
          this.blockDistanceNumber = this.pickers[this.selectedPicker].blockDistance;
          this.validateBlockDistanceForm.controls['blockDistance'].setValue(this.blockDistanceNumber);
        }
        this.bpsListTypeVariation = "variation" + (this.selectedPicker + 1).toString();   // update the variation of the list
        article['composition'] = compositions.join('-');
      }
    });

    if (this.blockDistanceNumber == 0 || this.blockDistanceNumber === undefined || this.blockDistanceNumber === null) {
      // if (this.unified3DModel.ProblemSetting.ProductType === 'Window') {
      //   this.blockDistanceNumber = 150;
      //   this.validateBlockDistanceForm.controls['blockDistance'].setValue(150);
      // }
      // else if (this.unified3DModel.ProblemSetting.ProductType === 'Facade') {
      //   this.blockDistanceNumber = 150;
      //   this.validateBlockDistanceForm.controls['blockDistance'].setValue(150);
      // }

      this.blockDistanceNumber = 150;
      this.validateBlockDistanceForm.controls['blockDistance'].setValue(150);
    }
  }
  // OnUnifiedModelUpdated() {
  //   if (this.umService.isProblemChanged) {
  //       this.reloadToDefault();
  //       this.loadGlassnPanel();
  //   }
  // }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onGlassPanelConfirm() {
    if (this.selectedPicker !== -1 && this.confirmedGlassPanelArticle) {  // library table confirmation
      let actualComposition = this.confirmedGlassPanelArticle.composition;
      let compositionList = this.confirmedGlassPanelArticle.composition.split('-');
      let compositionArray = [];
      this.pvbValue[this.selectedPicker] = ["", "", "", "", ""];
      this.pvbValueFull[this.selectedPicker] = ["", "", "", "", ""];
      let desciption = [];
      compositionList.forEach((element, index) => {
        let val = element.split('(');
        compositionArray.push(val[0]);
        let pvbVal = "";
        if (val && val.length > 1) {
          pvbVal = val[1].match(/\d.\d+/g);
          pvbVal = pvbVal[0].replace(',', '.');
        }
        this.pvbValue[this.selectedPicker][index] = pvbVal;
        if (val[1]) this.pvbValueFull[this.selectedPicker][index] = val[1].replace(')', '');
        if (pvbVal)
          desciption.push(val[0] + '[' + pvbVal + ']');
        else
          desciption.push(val[0]);
      });
      //let compositions = this.confirmedGlassPanelArticle.composition.split('(');
      let composition = compositionArray.join('-');
      let desciptions = desciption.join('-');
      this.confirmedGlassPanelArticle.composition = composition;
      this.elementsSize[this.selectedPicker] = this.configureService.applicationType == "SRS" ? this.confirmedGlassPanelArticle.compositionShort.split('-') : composition.split('-');
      this.elementsType[this.selectedPicker] = this.confirmedGlassPanelArticle.type.split('-');
      // if(compositions && compositions.length>1){
      //   //compositions[1] = "("+compositions[1];
      //   this.pvbValue[this.selectedPicker] = compositions[1].match(/\d.\d+/g);
      // }
      this.changeTypeToUpperCase(this.selectedPicker);
      this.pickers[this.selectedPicker].article = this.confirmedGlassPanelArticle;
      this.pickers[this.selectedPicker].article.idArticle = this.pickers[this.selectedPicker].idPicker;
      this.pickers[this.selectedPicker].article.composition = actualComposition;
      if (this.applicationType == "SRS")
        this.glassDescription = actualComposition;
      this.selectedGlassId_array = this.pickers[this.selectedPicker].glassId_added;
      this.pickers[this.selectedPicker].shgc = this.confirmedGlassPanelArticle.shgc;
      this.pickers[this.selectedPicker].vt = this.confirmedGlassPanelArticle.vt;
      this.pickers[this.selectedPicker].stc = this.confirmedGlassPanelArticle.stc;
      this.pickers[this.selectedPicker].oitc = this.confirmedGlassPanelArticle.oitc;
      this.onAddGlass(desciptions);
    }
  }
  ngOnChanges(Changes: SimpleChanges) {
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.unified3DModel = Changes.unified3DModel.currentValue;
        if (this.selectedPicker !== -1) {
          this.pickers[this.selectedPicker].blockDistance = this.blockDistanceNumber;
        }
        if (Changes.unified3DModel.previousValue) {
          if (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid) {
            this.reloadToDefault();
            this.loadGlassnPanel();
          }
        }
      }

      if (Changes.event3D) {
        if (Changes.event3D.currentValue && Changes.event3D.currentValue.eventType) {
          switch (Changes.event3D.currentValue.eventType) {
            case "selectGlass":
              this.selectedGlassId_array = Changes.event3D.currentValue.value.selectedGlassIDs;
              break;
            case "changeUnifiedModel":
              this.glassIDsAlreadyApplied = {};
              this.pickers.forEach(picker => {
                picker.glassId_added = [];
              });
              //disableresult
              this.configureService.computeClickedSubject.next(false);
              Changes.event3D.currentValue.value.ModelInput.Geometry.Infills.forEach(glass => {
                if (glass.GlazingSystemID > 0) {
                  this.pickers[glass.GlazingSystemID - 1].glassId_added.push(glass.InfillID);
                  this.glassIDsAlreadyApplied[glass.InfillID] = glass.GlazingSystemID - 1;
                }
                if (glass.PanelSystemID > 0) {
                  this.pickers[glass.PanelSystemID - 1].glassId_added.push(glass.InfillID);
                  this.glassIDsAlreadyApplied[glass.InfillID] = glass.PanelSystemID - 1;
                }
              });
              break;
          }
        }
      }

      if (this.selectedPicker !== -1 && Changes.spacerTypeArticle && !Changes.spacerTypeArticle.firstChange) {  // from spacer table
        let isValueChanged: boolean = this.spacerTypeModelInputArray[this.selectedPicker] != this.spacerTypeArticle[0].key;
        this.spacerTypeModelInputArray[this.selectedPicker] = this.spacerTypeArticle[0].key;
        this.spacerTypeDisplayInPanel[this.selectedPicker] = this.spacerTypeArticle[0].origin.title;
        if (isValueChanged) {
          let desciption = [];
          let compositionList = this.pickers[this.selectedPicker].article.composition.split('-');
          compositionList.forEach((element, index) => {
            let val = element.split('(');
            //compositionArray.push(val[0]);
            let pvbVal = "";
            if (val && val.length > 1) {
              pvbVal = val[1].match(/\d.\d+/g).toString();
              pvbVal[0].replace(',', '.')
            }
            // this.pvbValue[this.selectedPicker][index]=pvbVal;
            // if(val[1]) this.pvbValueFull[this.selectedPicker][index]=val[1].replace(')','');
            if (pvbVal)
              desciption.push(val[0] + '[' + pvbVal + ']');
            else
              desciption.push(val[0]);
          });
          let desciptions = desciption.join('-');
          this.selectedGlassId_array = this.pickers[this.selectedPicker].glassId_added;
          this.onAddGlass(desciptions);
        }
      }

      if (this.selectedPicker !== -1 && Changes.event3D && !Changes.event3D.firstChange) {
        if (this.event3D.eventType == "loadJSONFinished" && this.selectedPicker > -1) {
          setTimeout(() => {
            this.getSpacerTypeByKeyEvent.emit(this.spacerTypeModelInputArray[this.selectedPicker]);  // ask the spacer table to select and confirm spacer type with key
          });
        }
      }
    }

    if (this.selectedPicker > -1 && this.pickers[this.selectedPicker].article && this.pickers[this.selectedPicker].article.category === 'panel') {
      for (const key in this.validateBlockDistanceForm.controls) {
        this.validateBlockDistanceForm.controls[key].markAsDirty();
        this.validateBlockDistanceForm.controls[key].updateValueAndValidity();
      }
      for (const key in this.validatePSIForm.controls) {
        this.validatePSIForm.controls[key].markAsDirty();
        this.validatePSIForm.controls[key].updateValueAndValidity();
      }
    } else {
      for (const key in this.validateBlockDistanceForm.controls) {
        this.validateBlockDistanceForm.controls[key].markAsDirty();
        this.validateBlockDistanceForm.controls[key].updateValueAndValidity();
      }
    }


  }

  onAddPicker(): void { 
    if (!this.pickers[this.pickers.length - 1].populated) {
      this.blockDistanceNumber = 150;
      let previousSelectedPicker = this.selectedPicker;
      let firstUnpopulatedIndex: number = this.pickers.findIndex(this.checkUnpopulatedStatus);
      //this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault = false;        
      this.pickers[firstUnpopulatedIndex].populated = true;
      this.selectedPicker = firstUnpopulatedIndex;
      this.selectedPickerString = this.selectedPicker.toString();
      this.bpsListTypeVariation = "variation" + (this.selectedPicker + 1).toString();
      if (previousSelectedPicker !== -1) {
        this.spacerTypeModelInputArray[this.selectedPicker] = this.spacerTypeModelInputArray[previousSelectedPicker];
      }
      this.elementsSize[this.selectedPicker] = this.pickers[this.selectedPicker].article.composition.split('-');
      this.elementsType[this.selectedPicker] = this.pickers[this.selectedPicker].article.type.split('-');
      this.changeTypeToUpperCase(this.selectedPicker);
      // this.pickers[this.selectedPicker].article = this.confirmedGlassPanelArticle;  // same article than previous picker
      this.getSpacerTypeByKeyEvent.emit(this.spacerTypeModelInputArray[this.selectedPicker]);
    }
  }

  changeTypeToUpperCase(arrayIndex: number) {
    this.elementsType[arrayIndex].forEach((typeString, index) => {
      if (Boolean(typeString)) {
        let newString = typeString[0].toUpperCase() + typeString.slice(1);
        if (newString == 'Glass')
          newString = this.translate.instant(_('configure.glass'));
        else if (newString == 'Air')
          newString = this.translate.instant(_('configure.air'));
        this.elementsType[arrayIndex][index] = newString;
      }
    });
  }

  checkUnpopulatedStatus(picker): boolean {
    return !picker.populated;
  }
  blockDistanceNumberEvent(event: any) {
    // this.pickers[this.selectedPicker].blockDistance = event;
  }
  onBlockDistanceNumberChange() {
    if (this.blockDistanceNumber != this.pickers[this.selectedPicker].blockDistance)
      this.configureService.computeClickedSubject.next(false);
    if (this.selectedPicker > -1 && this.blockDistanceNumber) {
      // if (this.blockDistanceNumber < 70 || this.blockDistanceNumber > 250) {
      //   this.validateBlockDistanceForm.controls["blockDistance"].setErrors({ incorrect: true });
      // } 
      if (this.blockDistanceNumber >= 70 && this.blockDistanceNumber <= 250) {
        this.pickers[this.selectedPicker].glassId_added.forEach(element => {
          this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === element)[0].BlockDistance = this.blockDistanceNumber;
        });
        this.pickers[this.selectedPicker].blockDistance = this.blockDistanceNumber;
      }
    }
    else {
      this.blockDistanceNumber = undefined;
      this.validateBlockDistanceForm.controls["blockDistance"].setErrors({ incorrect: true });
    }
  }
  onPSIValueChange() {
    if (this.selectedPicker > -1 && this.psiValueNumber) {
      if (this.psiValueNumber < 0 || this.psiValueNumber > 10) {
        this.validatePSIForm.controls["psiValue"].setErrors({ incorrect: true });
      } else {
        if (this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID === this.selectedPicker + 1)[0] !== undefined)
          this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID === this.selectedPicker + 1)[0].Psi = this.psiValueNumber;
        this.pickers[this.selectedPicker].article.psiValue = this.psiValueNumber;
      }
    }
    else {
      setTimeout(() => {
        this.psiValueNumber = 0.13;
        this.validatePSIForm.controls["psiValue"].setErrors({ incorrect: true });
      }, 10);
    }
  }
  isValidNumber(value: any): boolean {
    if (!value)
      return false;
    if (isNaN(value))
      return false;
    if (value <= 0)
      return false;
    return true;
  }

  isFormValid(): boolean {
    // loop and check if any of the rw uvalues are empty for A and T.
    if (!this.unified3DModel.CollapsedPanels.Panel_Glass && (this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableThermal)) {
      var alertRwMsg = "GLASS RW is empty in {0} glass config, please fill the information";
      var alertUValueMsg = "CENTER OF GLASS U-VALUE is empty in {0} glass config, please fill the information";
      var alertRwIds = "";
      var alertUValueIds = "";
      this.unified3DModel.ModelInput.Geometry.GlazingSystems.forEach(gs => {
        if (this.unified3DModel.ProblemSetting.EnableAcoustic && (gs.Rw === undefined || gs.Rw.toString() == "N/D" || gs.Rw.toString() === "0") && this.unified3DModel.ModelInput.Geometry.Infills.filter(i => i.GlazingSystemID === gs.GlazingSystemID).length > 0) {
          alertRwIds += gs.GlazingSystemID + " ";
        }
        if (this.unified3DModel.ProblemSetting.EnableThermal && (gs.UValue === undefined || gs.UValue.toString() === "N/D" || gs.UValue.toString() === "0") && this.unified3DModel.ModelInput.Geometry.Infills.filter(i => i.GlazingSystemID === gs.GlazingSystemID).length > 0) {
          alertUValueIds += gs.GlazingSystemID + " ";
        }
      });
      if (alertRwIds !== "" || alertUValueIds !== "") {
        // setTimeout(() => {
        //   if (alertRwIds !== "")
        //     this.ngNotificaionShow.next({ title: "Missing Info", message: alertRwMsg.replace("{0}", alertRwIds), logoToShow: 'Acoustic' });
        //   if (alertUValueIds !== "")
        //     this.ngNotificaionShow.next({ title: "Missing Info", message: alertUValueMsg.replace("{0}", alertUValueIds), logoToShow: 'Thermal' });
        // }, 200);
        return false;
      }
    }
    if (this.selectedPicker > -1 && this.pickers[this.selectedPicker].article && this.pickers[this.selectedPicker].article.category === 'panel') {
      return this.validatePSIForm.valid && this.validateBlockDistanceForm.valid;
    } else {
      return this.validateBlockDistanceForm.valid;
    }
  }
  onSelectPicker() {
    this.selectedPicker = parseInt(this.selectedPickerString);
    this.blockDistanceNumber = this.pickers[this.selectedPicker].blockDistance;
    if (this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID === this.selectedPicker + 1)[0] !== undefined)
      this.psiValueNumber = this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID === this.selectedPicker + 1)[0].Psi;
    else this.psiValueNumber = 0;
    this.validateBlockDistanceForm.controls['blockDistance'].setValue(this.blockDistanceNumber);
    this.bpsListTypeVariation = "variation" + (this.selectedPicker + 1).toString();
    this.getSpacerTypeByKeyEvent.emit(this.spacerTypeModelInputArray[this.selectedPicker]);
  }

  onOpenCloseGlassPanelTable(): void {
    let composition = [];

    if (this.pickers[this.selectedPicker].article && this.pickers[this.selectedPicker].article.composition) {
      this.pickers[this.selectedPicker].article.composition.split('-').forEach((element, index) => {
        let val = element.split('(');
        if (this.pvbValue[this.selectedPicker][index]) {
          //composition.push(val[0]+'('+this.pvbValue[this.selectedPicker][index]+')');
          let pvbValByCulture = this.pvbValue[this.selectedPicker][index] ? (this.language === "DE" || this.language === "de-DE" ? this.pvbValue[this.selectedPicker][index].toString().replace('.', ',') : this.pvbValue[this.selectedPicker][index]) : this.pvbValue[this.selectedPicker][index];
          composition.push(val[0] + '(' + pvbValByCulture + 'mm ' + this.translate.instant(_('configure.acoustic')) + ' PVB)');
        }
        else
          composition.push(val[0]);
      });
      this.pickers[this.selectedPicker].article.composition = composition.join('-');
    }
    let articleData = this.pickers[this.selectedPicker].article;
    if (this.configureService.applicationType == "SRS")
      articleData.composition = this.glassDescription;
    this.cpService.setPopout(true, PanelsModule.GlassPanel);
    this.openCloseGlassPanelTableEvent.emit({ article: articleData });
  }

  onAddGlass(desciptions: string = "") {
    if ((this.confirmedGlassPanelArticle !== undefined && this.confirmedGlassPanelArticle.category === 'panel')
      || this.pickers[this.selectedPicker].article.category === 'panel') {
      this.onAddPanel(desciptions);
    } else {
      if (!desciptions || desciptions == "") {
        let compositionList = this.pickers[this.selectedPicker].article.composition.split('-');
        let compositionArray = [];
        this.pvbValue[this.selectedPicker] = ["", "", "", "", ""];
        this.pvbValueFull[this.selectedPicker] = ["", "", "", "", ""];
        let desciptionArr = [];
        compositionList.forEach((element, index) => {
          let val = element.split('(');
          compositionArray.push(val[0]);
          let pvbVal = "";
          if (val && val.length > 1) {
            pvbVal = val[1].match(/\d.\d+/g).toString();
            pvbVal[0].replace(',', '.')
          }
          this.pvbValue[this.selectedPicker][index] = pvbVal;
          if (val[1]) this.pvbValueFull[this.selectedPicker][index] = val[1].replace(')', '');
          if (pvbVal)
            desciptionArr.push(val[0] + '[' + pvbVal + ']');
          else
            desciptionArr.push(val[0]);
        });
        desciptions = desciptionArr.join('-');
      }
      //this.unified3DModel.ModelInput.Geometry.GlazingSystems[0].IsDefault = false;
      let glazingSystem = new GlazingSystem();
      //glazingSystem.IsDefault = false;
      glazingSystem.GlazingSystemID = this.selectedPicker + 1;
      glazingSystem.Rw = this.pickers[this.selectedPicker].article.rw;
      this.pickers[this.selectedPicker].article.uvalue = this.pickers[this.selectedPicker].article.uvalue.toString().replace(',', '.')
      glazingSystem.UValue = parseFloat(this.pickers[this.selectedPicker].article.uvalue);
      if(this.configureService.applicationType == "SRS"){
        if(this.pickers[this.selectedPicker].article.uvalue)
          this.pickers[this.selectedPicker].article.uvalueBTU = (parseFloat(this.pickers[this.selectedPicker].article.uvalue)/5.68).toFixed(3);
          
        glazingSystem.SHGC = this.pickers[this.selectedPicker].shgc;
        glazingSystem.VT = this.pickers[this.selectedPicker].vt;
        glazingSystem.OITC = this.pickers[this.selectedPicker].oitc;
        glazingSystem.STC = this.pickers[this.selectedPicker].stc;
      }
      glazingSystem.SpacerType = parseInt(this.spacerTypeModelInputArray[this.selectedPicker]);
      glazingSystem.Category = this.pickers[this.selectedPicker].article.category;
      let desciption = this.configureService.applicationType == "SRS"? this.pickers[this.selectedPicker].article.composition.replace(/-/g, "+")
                        :this.pickers[this.selectedPicker].article.composition.replace(/-/g, "/");
      if (desciptions)
        desciption = this.configureService.applicationType == "SRS"? desciptions.replace(/-/g, "+"):desciptions.replace(/-/g, "/");
      if(this.applicationType == "SRS" && this.pickers[this.selectedPicker].article.thicknessFraction){
        glazingSystem.Description = desciption + " (" + this.pickers[this.selectedPicker].article.totalThickness.toString() + " " + this.pickers[this.selectedPicker].article.thicknessFraction + " " + this.pickers[this.selectedPicker].article.totalThicknessUnit + ")";
      } else
        glazingSystem.Description = desciption + " (" + this.pickers[this.selectedPicker].article.totalThickness.toString() + " " + this.pickers[this.selectedPicker].article.totalThicknessUnit + ")";
      glazingSystem.Plates = [];
      glazingSystem.Cavities = [];
      this.pickers[this.selectedPicker].article.composition.split("-").forEach((item, index) => {
        if(this.applicationType == "SRS" && item.split(' ').length>0) item = item.split(' ')[0];
        switch (index % 2) {
          case 0:
            let plate = new Plate();
            if(this.applicationType == "SRS"){
              let material = this.pickers[this.selectedPicker].article.type.split("-")[index][0].toUpperCase() + this.pickers[this.selectedPicker].article.type.split("-")[index].slice(1);
              if(material.includes("glass") || material.includes("Glass"))
                plate.Material = "Glass"
            } else
              plate.Material = this.pickers[this.selectedPicker].article.type.split("-")[index][0].toUpperCase() + this.pickers[this.selectedPicker].article.type.split("-")[index].slice(1);
            plate.H = this.configureService.applicationType == "SRS"? eval(item)*25.4: parseFloat(item);// converts inches to mm for SRS
            if (this.pvbValue[this.selectedPicker]) {
              if (this.pvbValue[this.selectedPicker][index] > 0) plate.Material = "lamiAcousticPVB";
              plate.InterH = this.pvbValue[this.selectedPicker][index] ? eval(this.pvbValue[this.selectedPicker][index]) : 0;
            }
            glazingSystem.Plates.push(plate);
            break;
          case 1:
            let cavity = new Cavity();
            cavity.Lz = this.configureService.applicationType == "SRS"? eval(item)*25.4: parseFloat(item);// converts inches to mm for SRS
            cavity.CavityType = this.pickers[this.selectedPicker].article.type.split("-")[index][0].toUpperCase() + this.pickers[this.selectedPicker].article.type.split("-")[index].slice(1);
            //cavity.CavityType = 'Argon';
            glazingSystem.Cavities.push(cavity);
            break;
        }
      });
      this.selectedGlassId_array.forEach(glassId => {
        if (glassId in this.glassIDsAlreadyApplied) {
          this.pickers[this.glassIDsAlreadyApplied[glassId]].glassId_added = this.pickers[this.glassIDsAlreadyApplied[glassId]].glassId_added.filter(o => o !== glassId);
        }
        if (!this.unified3DModel.ModelInput.Geometry.GlazingSystems) {
          this.unified3DModel.ModelInput.Geometry.GlazingSystems = [];
        }
        this.unified3DModel.ModelInput.Geometry.PanelSystems = this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID !== this.selectedPicker + 1);
        this.unified3DModel.ModelInput.Geometry.GlazingSystems = this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(glazingSystem => glazingSystem.GlazingSystemID !== this.selectedPicker + 1);
        this.unified3DModel.ModelInput.Geometry.GlazingSystems.push(glazingSystem);
        this.pickers[this.selectedPicker].glassId_added.push(glassId);
        this.glassIDsAlreadyApplied[glassId] = this.selectedPicker;
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === glassId)[0].GlazingSystemID = glazingSystem.GlazingSystemID;
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === glassId)[0].PanelSystemID = -1;
      });
       this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      this.lc.loadDisplaySetting_ActivePanel();
      //disableresult
      this.configureService.computeClickedSubject.next(false);
      this.unified3DModelFromGlassPanelEvent.emit(this.unified3DModel);
      this.sendValidationBoolToParentEvent.emit();  // check if component is valid or not (blue orange dot ?)
      this.selectedGlassId_array = [];
    }
  }

  onAddPanel(desciptions: string = "") {
    if (!desciptions || desciptions == "") {
      let compositionList = this.pickers[this.selectedPicker].article.composition.split('-');
      let compositionArray = [];
      this.pvbValue[this.selectedPicker] = ["", "", "", "", ""];
      this.pvbValueFull[this.selectedPicker] = ["", "", "", "", ""];
      let desciptionArr = [];
      compositionList.forEach((element, index) => {
        let val = element.split('(');
        compositionArray.push(val[0]);
        let pvbVal = "";
        if (val && val.length > 1) {
          pvbVal = val[1].match(/\d.\d+/g).toString();
          pvbVal[0].replace(',', '.')
        }
        this.pvbValue[this.selectedPicker][index] = pvbVal;
        if (val[1]) this.pvbValueFull[this.selectedPicker][index] = val[1].replace(')', '');
        if (pvbVal)
          desciptionArr.push(val[0] + '[' + pvbVal + ']');
        else
          desciptionArr.push(val[0]);
      });
      desciptions = desciptionArr.join('-');
    }
    //this.unified3DModel.ModelInput.Geometry.PanelSystems[0].IsDefault = false;
    let panelSystem = new PanelSystem();
    //panelSystem.IsDefault = false;
    panelSystem.PanelSystemID = this.selectedPicker + 1;
    panelSystem.Rw = this.pickers[this.selectedPicker].article.rw;
    this.pickers[this.selectedPicker].article.uvalue = this.pickers[this.selectedPicker].article.uvalue.toString().replace(',', '.')
    panelSystem.UValue = parseFloat(this.pickers[this.selectedPicker].article.uvalue);
    panelSystem.PanelType = parseInt(this.spacerTypeModelInputArray[this.selectedPicker]);
    panelSystem.Psi = this.pickers[this.selectedPicker].article.psiValue ? this.pickers[this.selectedPicker].article.psiValue : 0.13;
    let desciption = this.configureService.applicationType == "SRS"? this.pickers[this.selectedPicker].article.composition.replace(/-/g, "+")
                      : this.pickers[this.selectedPicker].article.composition.replace(/-/g, "/");
    if (desciptions)
      desciption = this.configureService.applicationType == "SRS"? desciptions.replace(/-/g, "+"): desciptions.replace(/-/g, "/");
    panelSystem.Description = desciption + " (" + this.pickers[this.selectedPicker].article.totalThickness.toString() + " " + this.pickers[this.selectedPicker].article.totalThicknessUnit + ")";
    panelSystem.Thickness = this.pickers[this.selectedPicker].article.totalThickness;
    if (this.panelList.filter(e => e.composition === this.pickers[this.selectedPicker].article.composition)[0])
      panelSystem.PanelID = this.panelList.filter(e => e.composition === this.pickers[this.selectedPicker].article.composition)[0].id;
    panelSystem.Plates = [];
    panelSystem.Cavities = null;
    this.pickers[this.selectedPicker].article.composition.split("-").forEach((item, index) => {
      switch (index % 2) {
        case 0:
          let plate = new Plate();
          plate.Material = this.pickers[this.selectedPicker].article.type.split("-")[index][0].toUpperCase() + this.pickers[this.selectedPicker].article.type.split("-")[index].slice(1);
          plate.H = parseInt(item);
          if (this.pvbValue[this.selectedPicker]) {
            if (this.pvbValue[this.selectedPicker][index] > 0) plate.Material = "lamiAcousticPVB";
            plate.InterH = this.pvbValue[this.selectedPicker][index] ? parseFloat(this.pvbValue[this.selectedPicker][index]) : 0;
          }
          panelSystem.Plates.push(plate);
          break;
        case 1:
          var isInsulation = this.pickers[this.selectedPicker].article.type.split("-")[index][0].toUpperCase() + this.pickers[this.selectedPicker].article.type.split("-")[index].slice(1);
          if (isInsulation.toLocaleLowerCase() === 'air') {
            let cavity = new Cavity();
            cavity.Lz = parseInt(item);
            //JUHI: why are we saving argon and not taking the value selected by user? 
            cavity.CavityType = isInsulation;
            //cavity.CavityType = 'Argon';
            panelSystem.Cavities.push(cavity);
            break;
          } else {
            let plate = new Plate();
            plate.Material = isInsulation;
            plate.H = parseInt(item);
            if (this.pvbValue[this.selectedPicker]) {
              if (this.pvbValue[this.selectedPicker][index] > 0) plate.Material = "lamiAcousticPVB";
              plate.InterH = this.pvbValue[this.selectedPicker][index] ? parseFloat(this.pvbValue[this.selectedPicker][index]) : 0;
            }
            panelSystem.Plates.push(plate);
            break;
          }
      }
    });
    this.selectedGlassId_array.forEach(glassId => {
      if (glassId in this.glassIDsAlreadyApplied) {
        this.pickers[this.glassIDsAlreadyApplied[glassId]].glassId_added = this.pickers[this.glassIDsAlreadyApplied[glassId]].glassId_added.filter(o => o !== glassId);
      }
      if (!this.unified3DModel.ModelInput.Geometry.PanelSystems) {
        this.unified3DModel.ModelInput.Geometry.PanelSystems = [];
      }
      this.unified3DModel.ModelInput.Geometry.GlazingSystems = this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(glazingSystem => glazingSystem.GlazingSystemID !== this.selectedPicker + 1);
      this.unified3DModel.ModelInput.Geometry.PanelSystems = this.unified3DModel.ModelInput.Geometry.PanelSystems.filter(glazingSystem => glazingSystem.PanelSystemID !== this.selectedPicker + 1);
      this.unified3DModel.ModelInput.Geometry.PanelSystems.push(panelSystem);
      this.pickers[this.selectedPicker].glassId_added.push(glassId);
      this.glassIDsAlreadyApplied[glassId] = this.selectedPicker;
      this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === glassId)[0].PanelSystemID = panelSystem.PanelSystemID;
      this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === glassId)[0].GlazingSystemID = -1;
    });
     this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.lc.loadDisplaySetting_ActivePanel();
    //disableresult
    this.configureService.computeClickedSubject.next(false);
    this.unified3DModelFromGlassPanelEvent.emit(this.unified3DModel);
    this.sendValidationBoolToParentEvent.emit();  // check if component is valid or not (blue orange dot ?)
    this.selectedGlassId_array = [];
  }

  onDelete(glassId) {
    this.pickers[this.selectedPicker].glassId_added = this.pickers[this.selectedPicker].glassId_added.filter(o => o !== glassId);
    delete this.glassIDsAlreadyApplied[glassId];
    this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID === glassId)[0].GlazingSystemID = 0;
     this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.lc.loadDisplaySetting_ActivePanel();
    //disableresult
    this.configureService.computeClickedSubject.next(false);
    this.unified3DModelFromGlassPanelEvent.emit(this.unified3DModel);
    this.sendValidationBoolToParentEvent.emit();
  }

  isValid(): boolean {
    return this.isFormValid() && Object.keys(this.glassIDsAlreadyApplied).length === this.unified3DModel.ModelInput.Geometry.Infills.length;
  }

  onFocusGreen(glassId) {
    this.iframeEvent.next(new IFrameEvent('highlightGlassById', { id: glassId }));
  }

  onFocusRed(glassId, event) {  // event = true if mouse In, event = false if mouse out
    if (event) {
      let obj = { id: glassId, colorCode: "0xbc0000" };
      this.iframeEvent.next(new IFrameEvent('highlightGlassById', obj));
    }
    else {
      this.onFocusGreen(glassId);
    }
  }

  onFocusOutItem(glassId) {
    this.iframeEvent.next(new IFrameEvent('clearHighlightedMeshes'));
  }

  log(item, type = null, value = null) {
  }

  onOpenCloseSpacerTypePopout() {
    this.cpService.setPopout(true, PanelsModule.SpacerType);
  }

  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
