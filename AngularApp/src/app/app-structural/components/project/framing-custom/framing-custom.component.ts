import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BpsUnifiedModel, FacadeSection, Section } from 'src/app/app-common/models/bps-unified-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';

@Component({
  selector: 'app-framing-custom',
  templateUrl: './framing-custom.component.html',
  styleUrls: ['./framing-custom.component.css']
})

export class FramingCustomComponent implements OnInit {

  @Output() deleteMullionTransomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() addMullionTransomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateMullionTransomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() closeNdisableRightPanelEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() unified3DModel: BpsUnifiedModel;
  isDisplay: boolean = false;
  isAddButtonDisplay: boolean;
  isAddButtonActive: boolean;
  mullionArticleIndex: number;
  validateForm: FormGroup;
  validateUDCForm: FormGroup;

  facadeSectionElement: FacadeSection;
  facadeSectionElementString = {
    OutsideW: '',

    Depth: '',
    Width: '',
    BTDepth: '',

    Weight: '',
    A: '',
    Iyy: '',
    Izz: '',
    Asy: '',
    Asz: '',
    J: '',
    E: '',
    G: '',
    EA: '',
    GAsy: '',
    GAsz: '',
    EIy: '',
    EIz: '',
    GJ: '',
    Zo: '',
    Zu: '',
    Zl: '',
    Zr: '',
    Material: '',
    beta: '',
    Wyy: '',
    Wzz: '',
  };

  sectionElement: Section;
  sectionElementString = {
    d: '',
    Weight: '',
    Ao: '',
    Au: '',
    Io: '',
    Iu: '',
    Ioyy: '',
    Iuyy: '',
    Zoo: '',
    Zuo: '',
    Zou: '',
    Zuu: '',
    RSn20: '',
    RSp80: '',
    RTn20: '',
    RTp80: '',
    Cn20: '',
    Cp20: '',
    Cp80: '',

    Zol: '',
    Zul: '',
    Zor: '',
    Zur: ''
  };
  dxf: string;
  language: string;
  patternLanguage: string;


  constructor(private fb: FormBuilder,
    private umService: UnifiedModelService,
    private configureService: ConfigureService,
    private localStorageService: LocalStorageService) {
    this.language = this.configureService.getLanguage();
    this.patternLanguage = this.configureService.getNumberPattern();
  }

  ngOnInit(): void {
    /*this.unified3DModel = this.umService.current_UnifiedModel;
    this.onUnifiedModelUpdated();

    this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.buildForm();
          this.onUnifiedModelUpdated();
        }
      });*/
    this.isAddButtonDisplay = true;
    this.isAddButtonActive = this.isFormValid();
    this.sectionElement = new Section();
    Object.keys(this.sectionElementString).forEach(key => {
      this.sectionElementString[key] = '';
    });

    this.facadeSectionElement = new FacadeSection();
    Object.keys(this.facadeSectionElementString).forEach(key => {
      this.facadeSectionElementString[key] = '';
    });

    this.buildForm();
  }
  // onUnifiedModelUpdated() {  }
  buildForm() {
    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
        this.validateUDCForm = this.fb.group({
          profileName: ['', [Validators.required]],
          OutsideW: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Depth: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Width: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          BTDepth: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Weight: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          A: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Iyy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Izz: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Asy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Asz: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          J: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          E: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          G: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          EA: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          GAsy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          GAsz: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          EIy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          EIz: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          GJ: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zo: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zu: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zl: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zr: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Material: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          beta: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Wyy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Wzz: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
        });
      } else {
        this.validateForm = this.fb.group({
          profileName: ['', [Validators.required]],
          d: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          W: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Ao: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Au: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Io: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Iu: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Ioy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Iuy: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zoo: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zuo: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zou: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zuu: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          RSminus20: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          RS80: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          RTminus20: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          RT80: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Cminus20: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          C20: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          C80: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],

          Zol: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zul: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zor: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
          Zur: ['', [Validators.required, Validators.pattern(this.patternLanguage)]]
        });
      }
    }
  }
  openNewCustom() {
    this.ngOnInit();
    this.isDisplay = true;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
        for (const key in this.validateUDCForm.controls) {
          this.validateUDCForm.controls[key].markAsPristine();
          this.validateUDCForm.controls[key].markAsUntouched();
        }
      }
      else {
        for (const key in this.validateForm.controls) {
          this.validateForm.controls[key].markAsPristine();
          this.validateForm.controls[key].markAsUntouched();
        }
      }
    }
  }

  onCloseButton(): void {
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  onDelete(): void {
    this.deleteMullionTransomArticleEvent.emit(this.mullionArticleIndex);
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  onAdd(): void {
    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
        Object.keys(this.facadeSectionElementString).forEach(key => {
          this.facadeSectionElement[key] = parseFloat(this.facadeSectionElementString[key].replace(",", "."));
        });
        this.facadeSectionElement.isCustomProfile = true;
        this.facadeSectionElement.OutsideW = 0;
        this.addMullionTransomArticleEvent.emit(this.facadeSectionElement);
      } else {
        Object.keys(this.sectionElementString).forEach(key => {
          this.sectionElement[key] = parseFloat(this.sectionElementString[key].replace(",", "."));
        });
        this.sectionElement.isCustomProfile = true;
        this.sectionElement.OutsideW = 0;
        this.addMullionTransomArticleEvent.emit(this.sectionElement);
      }
    }
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  onUpdate(): void {
    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
        Object.keys(this.facadeSectionElementString).forEach(key => {
          this.facadeSectionElement[key] = parseFloat(this.facadeSectionElementString[key].replace(",", "."));
        });
        this.updateMullionTransomArticleEvent.emit({ sectionElement: this.facadeSectionElement, index: this.mullionArticleIndex })
      }
      else {
        Object.keys(this.sectionElementString).forEach(key => {
          this.sectionElement[key] = parseFloat(this.sectionElementString[key].replace(",", "."));
        });
        this.updateMullionTransomArticleEvent.emit({ sectionElement: this.sectionElement, index: this.mullionArticleIndex })
      }
    }
    this.isDisplay = false;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
  }

  isFormValid() {
    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC' && this.validateUDCForm && !this.validateUDCForm.pristine) {
        return this.validateUDCForm.valid;
      }
      else if (this.validateForm && !this.validateForm.pristine) {
        return this.validateForm.valid;
      }
    }
    return false;
  }

  editCustomArticle(data) {
    let sectionElement = data.article;
    let index = data.index;
    this.mullionArticleIndex = index;
    this.isDisplay = true;
    this.closeNdisableRightPanelEvent.emit(this.isDisplay);
    this.isAddButtonDisplay = false;

    if (this.unified3DModel) {
      if (this.unified3DModel.ProblemSetting.FacadeType === 'UDC') {
        this.facadeSectionElement = JSON.parse(JSON.stringify(sectionElement));
        Object.keys(this.facadeSectionElementString).forEach(key => {
          this.facadeSectionElementString[key] = sectionElement[key].toString();
          if (this.language == "de-DE") {
            this.facadeSectionElementString[key].replace(".", ",");
          }
        });
        for (const key in this.validateUDCForm.controls) {
          this.validateUDCForm.controls[key].markAsDirty();
          this.validateUDCForm.controls[key].updateValueAndValidity();
        }
      }
      else {
        this.sectionElement = JSON.parse(JSON.stringify(sectionElement));
        Object.keys(this.sectionElementString).forEach(key => {
          this.sectionElementString[key] = sectionElement[key].toString();
          if (this.language == "de-DE") {
            this.sectionElementString[key].replace(".", ",");
          }
        });
        for (const key in this.validateForm.controls) {
          this.validateForm.controls[key].markAsDirty();
          this.validateForm.controls[key].updateValueAndValidity();
        }
      }
    }
  }
}
