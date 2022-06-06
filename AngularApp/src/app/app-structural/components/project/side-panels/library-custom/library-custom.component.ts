import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BpsUnifiedModel, CustomGlass } from 'src/app/app-common/models/bps-unified-model';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';

@Component({
  selector: 'app-library-custom',
  templateUrl: './library-custom.component.html',
  styleUrls: ['./library-custom.component.css']
})
export class LibraryCustomComponent implements OnInit {
  private destroy$ = new Subject<void>();
  @Output() deleteLibraryCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() addLibraryCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateLibraryCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() closeNdisableRightPanelEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  unified3DModel: BpsUnifiedModel;
  glazingSystem: any;
  isDisplay: boolean = false;
  isAddButtonDisplay: boolean;
  isAddButtonActive: boolean;
  libraryArticleIndex: number;
  validateForm: FormGroup;
  libraryElements: any;
  defaultLibraryElements: any;
  dxf: string;
  language: string;
  patternLanguage: string;

  disableUpdate: boolean = true;
  applicationType: string;

  constructor(private umService: UnifiedModelService, private fb: FormBuilder, private configureService: ConfigureService, private localStorageService: LocalStorageService) {
    this.applicationType = this.configureService.applicationType;
    this.language = this.configureService.getLanguage();
    this.patternLanguage = this.configureService.getNumberPattern();
  }

  ngOnInit(article: CustomGlass = null): void {
    this.applicationType = this.configureService.applicationType;
    this.unified3DModel = this.umService.current_UnifiedModel;
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
        }
      });

    this.isAddButtonActive = this.isFormValid();
    if (article !== null) {
      this.isAddButtonDisplay = false;
      this.libraryElements = article;
      this.libraryElements.element_size_1 = article.element_size_1.includes('[') ? article.element_size_1.substring(0, article.element_size_1.indexOf('[')) : article.element_size_1;
      this.libraryElements.element_size_2 = article.element_size_2.includes('[') ? article.element_size_2.substring(0, article.element_size_2.indexOf('[')) : article.element_size_2;
      this.libraryElements.element_size_3 = article.element_size_3.includes('[') ? article.element_size_3.substring(0, article.element_size_3.indexOf('[')) : article.element_size_3;

      this.libraryElements.element_interlayer_1 = article.element_interlayer_1 == "0" ? null : article.element_interlayer_1;
      this.libraryElements.element_interlayer_2 = article.element_interlayer_2 == "0" ? null : article.element_interlayer_2;
      this.libraryElements.element_interlayer_3 = article.element_interlayer_3 == "0" ? null : article.element_interlayer_3;
      this.libraryElements.name = '';
      this.validateForm = this.fb.group({
        selectedType: [article.selectedType, [Validators.required]],
        name: ['custom', [Validators.required]],
        element_xx_1: [article.element_xx_1, [Validators.required]],
        element_type_1: [article.element_type_1, [Validators.required]],
        // element_size_1: [article.element_size_1, [Validators.required]],
        element_size_1: [article.element_size_1.includes('[') ? article.element_size_1.substring(0, article.element_size_1.indexOf('[')) : article.element_size_1, [Validators.required]],
        element_interlayer_1: [article.element_interlayer_1, [Validators.required, Validators.pattern(this.patternLanguage)]],
        element_ins_type_1: [article.element_ins_type_1, [Validators.required]],
        element_ins_size_1: [article.element_ins_size_1, [Validators.required]],
        element_xx_2: [article.element_xx_2, [Validators.required]],
        element_type_2: [article.element_type_2, [Validators.required]],
        //element_size_2: [article.element_size_2, [Validators.required]],
        element_size_2: [article.element_size_2.includes('[') ? article.element_size_2.substring(0, article.element_size_2.indexOf('[')) : article.element_size_2, [Validators.required]],
        element_interlayer_2: [article.element_interlayer_2, [Validators.required, Validators.pattern(this.patternLanguage)]],
        element_ins_type_2: [article.element_ins_type_2, [Validators.required]],
        element_ins_size_2: [article.element_ins_size_2, [Validators.required]],
        element_xx_3: [article.element_xx_3, [Validators.required]],
        element_type_3: [article.element_type_3, [Validators.required]],
        //element_size_3: [article.element_size_3, [Validators.required]],
        element_size_3: [article.element_size_3.includes('[') ? article.element_size_3.substring(0, article.element_size_3.indexOf('[')) : article.element_size_3, [Validators.required]],
        element_interlayer_3: [article.element_interlayer_3, [Validators.required, Validators.pattern(this.patternLanguage)]],
        uValue: [article.uValue, [Validators.required, Validators.pattern(this.patternLanguage)]],
        glassrw: [article.glassrw, [Validators.required, Validators.pattern(this.patternLanguage)]]
      });
    } else {
      this.isAddButtonDisplay = true;
      this.libraryElements = {
        customGlassID: 0,
        selectedType: 'custom-double',
        name: '',
        element_xx_1: 'HS',
        element_type_1: 'Glass',
        element_size_1: this.applicationType === 'BPS' ? '2' : '4',
        element_interlayer_1: null,

        element_ins_type_1: 'Air',
        element_ins_size_1: '12',

        element_xx_2: 'HS',
        element_type_2: 'Glass',
        element_size_2: this.applicationType === 'BPS' ? '2' : '4',
        element_interlayer_2: null,

        element_ins_type_2: 'Air',
        element_ins_size_2: '12',

        element_xx_3: 'HS',
        element_type_3: 'Glass',
        element_size_3: this.applicationType === 'BPS' ? '2' : '4',
        element_interlayer_3: null,

        uValue: '',
        glassrw: ''
      }
      this.validateForm = this.fb.group({
        selectedType: ['custom-double', [Validators.required]],
        name: ['Custom', [Validators.required]],
        element_xx_1: ['HS', [Validators.required]],
        element_type_1: ['Glass', [Validators.required]],
        element_size_1: ['2', [Validators.required]],
        element_interlayer_1: [null, [Validators.required, Validators.pattern(this.patternLanguage)]],
        element_ins_type_1: ['Air', [Validators.required]],
        element_ins_size_1: ['12', [Validators.required]],
        element_xx_2: ['HS', [Validators.required]],
        element_type_2: ['Glass', [Validators.required]],
        element_size_2: ['2', [Validators.required]],
        element_interlayer_2: [null, [Validators.required, Validators.pattern(this.patternLanguage)]],
        element_ins_type_2: ['Air', [Validators.required]],
        element_ins_size_2: ['12', [Validators.required]],
        element_xx_3: ['HS', [Validators.required]],
        element_type_3: ['Glass', [Validators.required]],
        element_size_3: ['2', [Validators.required]],
        element_interlayer_3: [null, [Validators.required, Validators.pattern(this.patternLanguage)]],
        uValue: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
        glassrw: ['', [Validators.required, Validators.pattern(this.patternLanguage)]]
      });
    }
    if (!this.libraryElements.element_interlayer_1) this.validateForm.controls["element_interlayer_1"].disable();
    if (!this.libraryElements.element_interlayer_2) this.validateForm.controls["element_interlayer_2"].disable();
    if (!this.libraryElements.element_interlayer_3) this.validateForm.controls["element_interlayer_3"].disable();
    this.defaultLibraryElements = this.libraryElements;
    // Object.keys(this.libraryElements).forEach(key => {
    //   this.libraryElements[key] = '';
    // });
  }

  glazingSystemsId = undefined;
  openNewCustom(article: any) {
    if (article.customGlassID === undefined) {
      this.glazingSystemsId = article.idArticle + 1;
      article = null;
    }
    this.ngOnInit(article);
    this.disableUpdate = true;
    this.isDisplay = true;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls[key].value) {
        this.validateForm.controls[key].markAsDirty();
        this.validateForm.controls[key].markAsUntouched();
      }
    }
  }

  onSelectTypeChange(selectType: string) {
    this.disableUpdate = false;
    if (selectType === 'custom-triple') {
      this.libraryElements.selectedType = 'custom-triple';
      // this.libraryElements.element_ins_type_2 = 'Air';
      // this.libraryElements.element_ins_size_2 = '12';
      // this.libraryElements.element_xx_3 = 'HS';
      // this.libraryElements.element_type_3 = 'Glass';
      // this.libraryElements.element_size_3 = '4';
      // this.libraryElements.element_interlayer_3 = '1.52';
    } else if (selectType === 'custom-double') {
      this.libraryElements.selectedType = 'custom-double';
      // this.libraryElements.element_ins_type_2 = undefined;
      // this.libraryElements.element_ins_size_2 = undefined;
      // this.libraryElements.element_xx_3 = undefined;
      // this.libraryElements.element_type_3 = undefined;
      // this.libraryElements.element_size_3 = undefined;
      // this.libraryElements.element_interlayer_3 = undefined;
    }
  }

  onCloseButton(): void {
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  onDelete(): void {
    this.deleteLibraryCustomArticleEvent.emit(this.libraryArticleIndex);
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  onAdd(): void {
    this.buildModel(true);
  }

  onUpdate(): void {
    this.buildModel(false);
  }

  buildModel(isNew: boolean = true): void {
    this.libraryElements = this.defaultLibraryElements;
    this.unified3DModel.ModelInput.Geometry.GlazingSystems = this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(element => element.GlazingSystemID !== this.glazingSystemsId);
    if (!this.unified3DModel.ProblemSetting.EnableThermal) this.libraryElements.uValue = "";
    if (!this.unified3DModel.ProblemSetting.EnableAcoustic) this.libraryElements.glassrw = "";
    let sectionElement = this.libraryElements;
    if (sectionElement.element_type_1 === 'lamiAcousticPVB') sectionElement.element_size_1 += '[' + sectionElement.element_interlayer_1 + ']';
    if (sectionElement.element_type_2 === 'lamiAcousticPVB') sectionElement.element_size_2 += '[' + sectionElement.element_interlayer_2 + ']';
    if (sectionElement.element_type_3 === 'lamiAcousticPVB') sectionElement.element_size_3 += '[' + sectionElement.element_interlayer_3 + ']';
    let es1 = sectionElement.element_size_1; let es2 = sectionElement.element_size_2; let es3 = sectionElement.element_size_3;
    const element_type_1 = sectionElement.element_type_1 === 'lamiAcousticPVB' ? 'Glass' : sectionElement.element_type_1;
    const element_type_2 = sectionElement.element_type_2 === 'lamiAcousticPVB' ? 'Glass' : sectionElement.element_type_2;
    const element_type_3 = sectionElement.element_type_3 === 'lamiAcousticPVB' ? 'Glass' : sectionElement.element_type_3;
    var language = this.configureService.getLanguage();
    let thickness = parseInt(sectionElement.element_size_1) + parseInt(sectionElement.element_ins_size_1) + parseInt(sectionElement.element_size_2);
    let composition = es1 + "-" + sectionElement.element_ins_size_1 + "-" + es2;
    let type = element_type_1 + "-" + sectionElement.element_ins_type_1 + "-" + element_type_2;
    let description = sectionElement.element_size_1 + "/" + sectionElement.element_ins_size_1 + "/" + sectionElement.element_size_2;

    if (sectionElement.element_type_1 === 'Glass') sectionElement.element_interlayer_1 = 0;
    if (sectionElement.element_type_2 === 'Glass') sectionElement.element_interlayer_2 = 0;
    if (sectionElement.element_type_3 === 'Glass') sectionElement.element_interlayer_3 = 0;

    if (sectionElement.selectedType == 'custom-triple') {
      thickness = thickness + parseInt(sectionElement.element_ins_size_2) + parseInt(sectionElement.element_size_3);
      composition += "-" + sectionElement.element_ins_size_2 + "-" + es3;
      type += "-" + sectionElement.element_ins_type_2 + "-" + element_type_3;
      description += "/" + sectionElement.element_ins_size_2 + "/" + sectionElement.element_size_3
    }
    if (!this.unified3DModel.ModelInput.Geometry.CustomGlass)
      this.unified3DModel.ModelInput.Geometry.CustomGlass = [];
    if (isNew) {
      sectionElement.customGlassID = this.unified3DModel.ModelInput.Geometry.CustomGlass.length;
      this.unified3DModel.ModelInput.Geometry.CustomGlass.push(sectionElement);
    } else {
      this.unified3DModel.ModelInput.Geometry.CustomGlass[this.libraryElements.customGlassID] = sectionElement;
    }
    var newCustom = {
      composition: composition,
      type: type,
      totalThickness: thickness,
      totalThicknessUnit: "mm",
      uvalue: sectionElement.uValue ? parseFloat((language === "DE" || language === "de-DE" ? sectionElement.uValue.replace('.', ',') : sectionElement.uValue)) : "N/D",
      rw: sectionElement.glassrw ? parseFloat(sectionElement.glassrw) : "N/D",
      spacer: ["1"],
      category: sectionElement.selectedType
    };

    description += " (" + newCustom.totalThickness + " " + newCustom.totalThicknessUnit + ")";// + newCustom.category;
    if (sectionElement.selectedType == 'custom-triple') {
      this.glazingSystem = {
        "GlazingSystemID": this.glazingSystemsId,
        "Rw": newCustom.rw,
        "UValue": newCustom.uvalue,
        "SpacerType": 1,
        "Description": description,
        "Plates": [{
          "UDF1": sectionElement.element_xx_1,
          "Material": sectionElement.element_type_1,
          "H": sectionElement.element_size_1,
          "InterH": sectionElement.element_interlayer_1
        }, {
          "UDF1": sectionElement.element_xx_2,
          "Material": sectionElement.element_type_2,
          "H": sectionElement.element_size_2,
          "InterH": sectionElement.element_interlayer_2
        }, {
          "UDF1": sectionElement.element_xx_3,
          "Material": sectionElement.element_type_3,
          "H": sectionElement.element_size_3,
          "InterH": sectionElement.element_interlayer_3
        }],
        "Cavities": [{
          "CavityType": sectionElement.element_ins_type_1,
          "Lz": sectionElement.element_ins_size_1
        }, {
          "CavityType": sectionElement.element_ins_type_2,
          "Lz": sectionElement.element_ins_size_2
        }],
        "Category": sectionElement.selectedType,
      };
    } else {
      this.glazingSystem = {
        "GlazingSystemID": this.glazingSystemsId,
        "Rw": newCustom.rw,
        "UValue": newCustom.uvalue,
        "SpacerType": 1,
        "Description": description,
        "Plates": [{
          "UDF1": sectionElement.element_xx_1,
          "Material": sectionElement.element_type_1,
          "H": sectionElement.element_size_1,
          "InterH": sectionElement.element_interlayer_1
        }, {
          "UDF1": sectionElement.element_xx_2,
          "Material": sectionElement.element_type_2,
          "H": sectionElement.element_size_2,
          "InterH": sectionElement.element_interlayer_2
        }],
        "Cavities": [{
          "CavityType": sectionElement.element_ins_type_1,
          "Lz": sectionElement.element_ins_size_1
        }],
        "Category": sectionElement.selectedType,
      };
    }
    this.unified3DModel.ModelInput.Geometry.GlazingSystems.push(this.glazingSystem);
    if (isNew) {
      this.addLibraryCustomArticleEvent.emit(newCustom);
    } else {
      this.updateLibraryCustomArticleEvent.emit(newCustom);
    }
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  hasDuplicateGlass = false;
  checkForDuplicateCustomGlass() {
    if (this.libraryElements) {
      this.hasDuplicateGlass = false;
      var customGlassList = this.unified3DModel.ModelInput.Geometry.CustomGlass;
      if (!this.isAddButtonDisplay)
        customGlassList = this.unified3DModel.ModelInput.Geometry.CustomGlass.filter(f => f.customGlassID !== this.libraryElements.customGlassID);
      if (customGlassList) {
        customGlassList.forEach(customGlass => {
          if (customGlass.element_ins_size_1 === this.libraryElements.element_ins_size_1 &&
            customGlass.element_ins_size_2 === this.libraryElements.element_ins_size_2 &&
            customGlass.element_ins_type_1 === this.libraryElements.element_ins_type_1 &&
            customGlass.element_ins_type_2 === this.libraryElements.element_ins_type_2 &&

            (customGlass.element_interlayer_1 === this.libraryElements.element_interlayer_1 || (customGlass.element_interlayer_1 === "0" && this.libraryElements.element_interlayer_1 == null)) &&
            (customGlass.element_interlayer_2 === this.libraryElements.element_interlayer_2 || (customGlass.element_interlayer_2 === "0" && this.libraryElements.element_interlayer_2 == null)) &&
            (customGlass.element_interlayer_3 === this.libraryElements.element_interlayer_3 || (customGlass.element_interlayer_3 === "0" && this.libraryElements.element_interlayer_3 == null)) &&

            customGlass.element_size_1 === this.libraryElements.element_size_1 &&
            customGlass.element_size_2 === this.libraryElements.element_size_2 &&
            customGlass.element_size_3 === this.libraryElements.element_size_3 &&
            customGlass.element_type_1 === this.libraryElements.element_type_1 &&
            customGlass.element_type_2 === this.libraryElements.element_type_2 &&
            customGlass.element_type_3 === this.libraryElements.element_type_3 &&
            customGlass.element_xx_1 === this.libraryElements.element_xx_1 &&
            customGlass.element_xx_2 === this.libraryElements.element_xx_2 &&
            customGlass.element_xx_3 === this.libraryElements.element_xx_3 &&
            customGlass.glassrw === this.libraryElements.glassrw &&
            //customGlass.name === this.libraryElements.name &&
            customGlass.selectedType === this.libraryElements.selectedType &&
            customGlass.uValue === this.libraryElements.uValue) {
            this.hasDuplicateGlass = true;
          }
        });
      }
    }
  }
  isFormValid() {
    this.checkForDuplicateCustomGlass();
    if (this.validateForm) {
      if (this.validateForm.touched)
        this.disableUpdate = false;
      if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
        this.validateForm.controls.glassrw.enable();
        if (this.libraryElements.uValue === undefined || this.libraryElements.uValue === "N/D" || this.libraryElements.uValue === "0") {
          this.disableUpdate = false;
        }
        if (this.isAddButtonDisplay === false) {
          for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
            this.validateForm.controls[key].updateValueAndValidity();
          }
        }
      }
      else
        this.validateForm.controls.glassrw.disable();

      if (this.unified3DModel.ProblemSetting.EnableThermal) {
        this.validateForm.controls.uValue.enable();
        if (this.libraryElements.glassrw === undefined || this.libraryElements.glassrw.toString() == "N/D" || this.libraryElements.glassrw === 0) {
          this.disableUpdate = false;
        }
        if (this.isAddButtonDisplay === false) {
          for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
            this.validateForm.controls[key].updateValueAndValidity();
          }
        }
      }
      else
        this.validateForm.controls.uValue.disable();
      if (this.validateForm.pristine && !(this.validateForm.dirty || this.validateForm.touched)) {
        return this.validateForm.valid;
      }
      if (!this.validateForm.pristine) {
        return this.validateForm.valid;
      }
    }

    return false;
  }

  editCustomArticle(data) {
    let sectionElement = data.article;
    let index = data.index;
    this.isDisplay = true;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
    this.isAddButtonDisplay = false;
    this.libraryElements = JSON.parse(JSON.stringify(sectionElement));
    this.libraryArticleIndex = index;
    Object.keys(this.libraryElements).forEach(key => {
      this.libraryElements[key] = sectionElement[key].toString();
      if (this.language == "de-DE") {
        this.libraryElements[key].replace(".", ",");
      }
    });
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

  changeElement_type_1($event: any) {
    if (this.defaultLibraryElements.element_type_1 !== $event) {
      this.defaultLibraryElements.element_type_1 = $event;
      if (this.libraryElements.element_type_1 === 'Glass') {
        this.libraryElements.element_size_1 = this.applicationType === 'BPS' ? '2' : '4';
        this.libraryElements.element_interlayer_1 = null;
        this.defaultLibraryElements.element_interlayer_1 = this.libraryElements.element_interlayer_1;
        this.defaultLibraryElements.element_size_1 = this.libraryElements.element_size_1;
        this.validateForm.controls["element_interlayer_1"].disable();
      } else {
        this.validateForm.controls["element_interlayer_1"].enable();
        this.validateForm.controls["element_interlayer_1"].markAsTouched();
        this.libraryElements.element_size_1 = this.applicationType === 'BPS' ? '4' : '3';
        this.defaultLibraryElements.element_size_1 = this.libraryElements.element_size_1;
      }
    }
  }

  changeElement_type_2($event: any) {
    if (this.defaultLibraryElements.element_type_2 !== $event) {
      this.defaultLibraryElements.element_type_2 = $event;
      if (this.libraryElements.element_type_2 === 'Glass') {
        this.libraryElements.element_size_2 = this.applicationType === 'BPS' ? '2' : '4';
        this.libraryElements.element_interlayer_2 = null;
        this.defaultLibraryElements.element_size_2 = this.libraryElements.element_size_2;
        this.defaultLibraryElements.element_interlayer_2 = this.libraryElements.element_interlayer_2;
        this.validateForm.controls["element_interlayer_2"].disable();
      } else {
        this.validateForm.controls["element_interlayer_2"].enable();
        this.validateForm.controls["element_interlayer_2"].markAsTouched();
        this.libraryElements.element_size_2 = this.applicationType === 'BPS' ? '4' : '3';
        this.defaultLibraryElements.element_size_2 = this.libraryElements.element_size_2;
      }
    }
  }

  changeElement_type_3($event: any) {
    if (this.defaultLibraryElements.element_type_3 !== $event) {
      this.defaultLibraryElements.element_type_3 = $event;
      if (this.libraryElements.element_type_3 === 'Glass') {
        this.libraryElements.element_size_3 = this.applicationType === 'BPS' ? '2' : '4';
        this.libraryElements.element_interlayer_3 = null;
        this.defaultLibraryElements.element_size_3 = this.libraryElements.element_size_3;
        this.defaultLibraryElements.element_interlayer_3 = this.libraryElements.element_interlayer_3;
        this.validateForm.controls["element_interlayer_3"].disable();
      } else {
        this.validateForm.controls["element_interlayer_3"].enable();
        this.validateForm.controls["element_interlayer_3"].markAsTouched();
        this.libraryElements.element_size_3 = this.applicationType === 'BPS' ? '4' : '3';
        this.defaultLibraryElements.element_size_3 = this.libraryElements.element_size_3;
      }
    }
  }

  changeElement_xx_1($event: any) { this.defaultLibraryElements.element_xx_1 = $event; }
  changeElement_xx_2($event: any) { this.defaultLibraryElements.element_xx_2 = $event; }
  changeElement_xx_3($event: any) { this.defaultLibraryElements.element_xx_3 = $event; }

  changeElement_ins_type_1($event: any) { this.defaultLibraryElements.element_ins_type_1 = $event; }
  changeElement_ins_type_2($event: any) { this.defaultLibraryElements.element_ins_type_2 = $event; }

  changeElement_ins_size_1($event: any) { this.defaultLibraryElements.element_ins_size_1 = $event; }
  changeElement_ins_size_2($event: any) { this.defaultLibraryElements.element_ins_size_2 = $event; }

  changeElement_interlayer_1($event: any) { this.defaultLibraryElements.element_interlayer_1 = $event; }
  changeElement_interlayer_2($event: any) { this.defaultLibraryElements.element_interlayer_2 = $event; }
  changeElement_interlayer_3($event: any) { this.defaultLibraryElements.element_interlayer_3 = $event; }

  changeElement_size_1($event: any) { this.defaultLibraryElements.element_size_1 = $event; }
  changeElement_size_2($event: any) { this.defaultLibraryElements.element_size_2 = $event; }
  changeElement_size_3($event: any) { this.defaultLibraryElements.element_size_3 = $event; }

  changeElement_uValue($event: any) {
    if (this.defaultLibraryElements.uValue != $event)
      this.disableUpdate = false;
    this.defaultLibraryElements.uValue = $event;
  }
  changeElement_glassrw($event: any) {
    if (this.defaultLibraryElements.glassrw != $event)
      this.disableUpdate = false;
    this.defaultLibraryElements.glassrw = $event;
  }
}
