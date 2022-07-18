import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, SimpleChanges } from '@angular/core';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { FacadeStructuralResult, StructuralResult, UDCStructuralResult } from 'src/app/app-common/models/bps-structural-result';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { Subject, Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

@Component({
  selector: 'app-left-structural-panel',
  templateUrl: './left-structural-panel.component.html',
  styleUrls: ['./left-structural-panel.component.css']
})
export class LeftStructuralPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private configureService: ConfigureService, private resultService: ResultService, private localStorageService: LocalStorageService, private translate: TranslateService) {
  }
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() selectedStructuralIntermediate: number[];
  @Input() selectedStructuralIntermediateFacade: number[];
  @Output() sendSelectedIntermediate: EventEmitter<number> = new EventEmitter();
  @Output() sendIntermediateRedColor: EventEmitter<any[]> = new EventEmitter();
  bpsStructuralResult: StructuralResult;
  bpsFacadeStructuralResult: FacadeStructuralResult;
  bpsUDCStructuralResult: UDCStructuralResult;
  memberName: string;
  isTransom: boolean = true;
  articleId: string;
  articleImgUrl: string = "";

  stressRation: number;
  shearRatio: number;
  deflectionRatio: number;
  verticalDeflectionRatio: number;

  outofplaneBendingCapacityRatio: number;
  outofplaneReinfBendingCapacityRatio: number;
  inplaneBendingCapacityRatio: number;
  outofplaneDeflectionCapacityRatio: number;
  inplaneDeflectionCapacityRatio: number;

  language: string = '';


  ngOnInit(): void {
    this.language = this.configureService.getLanguage();
    this.GetStructuralResults();
  }
  ngOnChanges(Changes: SimpleChanges) {
    if (this.bpsStructuralResult || this.bpsFacadeStructuralResult || this.bpsUDCStructuralResult) {
      this.SetStructuralResultLabels();
    }
    if (Changes.unified3DModel && !Changes.unified3DModel.firstChange) {
      this.GetStructuralResults();
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

  }

  /**
   * Map the data of the structural resultats to display the relevant information in the table
   */
  SetStructuralResultLabels() {
    if (this.selectedStructuralIntermediate && this.selectedStructuralIntermediate.length > 0) {
      this.resultService.selectedIntermediatesStructural = this.selectedStructuralIntermediate[0];
      this.PopulateStructuralResultForMemeber();
    }
    else if (this.selectedStructuralIntermediateFacade && this.selectedStructuralIntermediateFacade.length > 0) {
      this.resultService.selectedIntermediatesStructural = this.selectedStructuralIntermediateFacade[0];
      this.PopulateStructuralResultForMemeber();
    }
    else if (!this.selectedStructuralIntermediate || (this.selectedStructuralIntermediate && this.selectedStructuralIntermediate.length == 0) ||
      (this.selectedStructuralIntermediateFacade || (this.selectedStructuralIntermediateFacade && this.selectedStructuralIntermediateFacade.length == 0))) {
      this.isTransom = true;
      this.articleId = null;
      this.articleImgUrl = '';
      this.memberName = null;
      this.stressRation = null;
      this.shearRatio = null;
      this.deflectionRatio = null;
      this.verticalDeflectionRatio = null;
      this.outofplaneBendingCapacityRatio = null;
      this.outofplaneReinfBendingCapacityRatio = null;
      this.inplaneBendingCapacityRatio = null;
      this.outofplaneDeflectionCapacityRatio = null;
      this.inplaneDeflectionCapacityRatio = null;
      let memberList = [];

      if (this.unified3DModel.ProblemSetting.ProductType === "Window") {
        if (this.bpsStructuralResult && this.bpsStructuralResult.MemberResults)
          this.bpsStructuralResult.MemberResults.forEach(element => {
            let color = "0xA2D892";
            if (element.shearRatio > 1 || element.stressRatio > 1 || element.deflectionRatio > 1 || element.verticalDeflectionRatio > 1)
              color = "0xbc0000";
            memberList.push({ id: element.memberID, color: color });
          });
      }
      else {
        if (this.bpsFacadeStructuralResult && this.bpsFacadeStructuralResult.MemberResults) {
          this.bpsFacadeStructuralResult.MemberResults.forEach(element => {
            let color = "0xA2D892";
            if (element.outofplaneBendingCapacityRatio > 1 || element.outofplaneReinfBendingCapacityRatio > 1 || element.inplaneBendingCapacityRatio > 1
              || element.outofplaneDeflectionCapacityRatio > 1 || element.inplaneDeflectionCapacityRatio > 1)
              color = "0xbc0000";
            memberList.push({ id: element.memberID, color: color });
          });
        }
        else if (this.bpsUDCStructuralResult && this.bpsUDCStructuralResult.MemberResults) {
          this.bpsUDCStructuralResult.MemberResults.forEach(element => {
            let color = "0xA2D892";
            if (element.outofplaneBendingCapacityRatio > 1 || element.inplaneBendingCapacityRatio > 1
              || element.outofplaneDeflectionCapacityRatio > 1 || element.inplaneDeflectionCapacityRatio > 1)
              color = "0xbc0000";
            memberList.push({ id: element.memberID, color: color });
          });
        }
      }
      // if(memberList && memberList.length>0){
      //   this.sendIntermediateRedColor.emit(memberList);
      // }
    }
  }
  /**
   * Get the structural result which depends on the configuration
   */
  GetStructuralResults() {
    if (this.unified3DModel.ProblemSetting.ProductType === "Window") {
      if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.StructuralResult) {
        this.bpsStructuralResult = this.unified3DModel.AnalysisResult.StructuralResult;
        this.SetStructuralResultLabels();
        if (this.resultService.selectedIntermediatesStructural) {
          this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
        }
      }
    } else {
      if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.FacadeStructuralResult) {
        this.bpsFacadeStructuralResult = this.unified3DModel.AnalysisResult.FacadeStructuralResult;
        this.SetStructuralResultLabels();
        if (this.resultService.selectedIntermediatesStructural) {
          this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
        }
      }
      else if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.UDCStructuralResult) {
        this.bpsUDCStructuralResult = this.unified3DModel.AnalysisResult.UDCStructuralResult;
        this.SetStructuralResultLabels();
        if (this.resultService.selectedIntermediatesStructural) {
          this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
        }
      }
    }
    // if(this.resultService.isStructuralComputed){
    //   if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult && this.unified3DModel.BpsAnalysisResult.StructuralResult) {
    //     this.bpsStructuralResult = this.unified3DModel.BpsAnalysisResult.StructuralResult;
    //     this.SetStructuralResultLabels();
    //     if (this.resultService.selectedIntermediatesStructural) {
    //       this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
    //     }
    //   }
    //   this.resultService.isStructuralComputed = false;
    // }
    // else{
    //   this.structuralResultSubscription = this.resultService.structuralResultSubject.subscribe((response) => {
    //     this.unified3DModel = response;
    //     if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult && this.unified3DModel.BpsAnalysisResult.StructuralResult) {
    //       this.bpsStructuralResult = this.unified3DModel.BpsAnalysisResult.StructuralResult;
    //       this.SetStructuralResultLabels();
    //       if (this.resultService.selectedIntermediatesStructural) {
    //         this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
    //       }
    //     }
    //   });
    // }


    // if (this.resultService.structuralAnalysis) {
    //   this.unified3DModel = this.resultService.structuralAnalysis;
    //   if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult && this.unified3DModel.BpsAnalysisResult.StructuralResult) {
    //     this.bpsStructuralResult = this.unified3DModel.BpsAnalysisResult.StructuralResult;
    //     this.SetStructuralResultLabels();
    //     if(this.resultService.selectedIntermediatesStructural){
    //       this.sendSelectedIntermediate.emit(this.resultService.selectedIntermediatesStructural);
    //     }
    //   }
    // } else {
    //   this.resultService.runStructuralAnalysis(this.unified3DModel).pipe(takeUntil(this.destroy$)).subscribe((response) => {
    //     this.resultService.structuralAnalysis = response;
    //     this.unified3DModel = response;
    //     if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult && this.unified3DModel.BpsAnalysisResult.StructuralResult) {
    //       this.bpsStructuralResult = this.unified3DModel.BpsAnalysisResult.StructuralResult;
    //     }
    //   });
    // }
  }

  /**
   * Populate the structural result after the structural result labels are set.
   */
  PopulateStructuralResultForMemeber() {
    if (this.unified3DModel.ProblemSetting.ProductType === "Window") {
      let selectedMembers = this.bpsStructuralResult.MemberResults.filter(x => this.selectedStructuralIntermediate[0] == (x.memberID));
      if (selectedMembers && selectedMembers.length > 0) {
        let selectedMember = selectedMembers[0];
        this.shearRatio = selectedMember.shearRatio * 100;
        this.stressRation = selectedMember.stressRatio * 100;
        this.deflectionRatio = selectedMember.deflectionRatio * 100;
        this.verticalDeflectionRatio = selectedMember.verticalDeflectionRatio * 100;
        let members = this.unified3DModel.ModelInput.Geometry.Members.filter(x => x.MemberID == selectedMember.memberID);
        if (members && members.length == 1) {
          let member = members[0];
          this.isTransom = false;
          switch (member.MemberType) {
            case 1:
              this.memberName = this.translate.instant(_('result.outer-frame'));
              break;
            case 2:
              this.memberName = this.translate.instant(_('result.mullion'));
              break;
            case 3:
              this.memberName = this.translate.instant(_('result.transom'));
              this.isTransom = true;
              break;
          }
          if (this.unified3DModel.ModelInput.Geometry.Sections !== null) {
            let sections = this.unified3DModel.ModelInput.Geometry.Sections.filter(x => x.SectionID == member.SectionID);
            if (sections && sections.length == 1) {
              this.articleId = sections[0].ArticleName;
              this.articleImgUrl = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/cross-section/' + this.articleId + '.jpg';
            }
          }
        }
      }
    } else {
      if (this.bpsFacadeStructuralResult) {
        let selectedMembers = this.bpsFacadeStructuralResult.MemberResults.filter(x => this.selectedStructuralIntermediateFacade[0] == (x.memberID));
        if (selectedMembers && selectedMembers.length > 0) {
          let selectedMember = selectedMembers[0];
          this.outofplaneBendingCapacityRatio = selectedMember.outofplaneBendingCapacityRatio * 100;
          this.outofplaneReinfBendingCapacityRatio = selectedMember.outofplaneReinfBendingCapacityRatio * 100;
          this.inplaneBendingCapacityRatio = selectedMember.inplaneBendingCapacityRatio * 100;
          this.outofplaneDeflectionCapacityRatio = selectedMember.outofplaneDeflectionCapacityRatio * 100;
          this.inplaneDeflectionCapacityRatio = selectedMember.inplaneDeflectionCapacityRatio * 100;
          let members = this.unified3DModel.ModelInput.Geometry.Members.filter(x => x.MemberID == selectedMember.memberID);
          if (members && members.length == 1) {
            let member = members[0];
            this.isTransom = false;
            //1: Outer Frame, 2: Mullion, 3: transom,  4: Facade Major Mullion, 5: Facade Transom, 6 Facade Minor Mullion
            switch (member.MemberType) {
              case 1:
                this.memberName = this.translate.instant(_('result.outer-frame'));
                break;
              case 2:
                this.memberName = this.translate.instant(_('result.mullion'));
                break;
              case 3:
                this.memberName = this.translate.instant(_('result.transom'));
                this.isTransom = true;
                break;
              case 4:
                this.memberName = this.translate.instant(_('result.facade-major-mullion'));
                break;
              case 5:
                this.memberName = this.translate.instant(_('result.facade-transom'));
                this.isTransom = true;
                break;
              case 6:
                this.memberName = this.translate.instant(_('result.facade-minor-mullion'));
                break;
            }
            if (this.unified3DModel.ModelInput.Geometry.FacadeSections !== null) {
              let sections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(x => x.SectionID == member.SectionID);
              if (sections && sections.length == 1) {
                this.articleId = sections[0].ArticleName;
                this.articleImgUrl = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/' + this.articleId + '.jpg';
              }
            }
          }
        }
      }
      else
        if (this.bpsUDCStructuralResult) {
          let selectedMembers = this.bpsUDCStructuralResult.MemberResults.filter(x => this.selectedStructuralIntermediateFacade[0] == (x.memberID));
          if (selectedMembers && selectedMembers.length > 0) {
            let selectedMember = selectedMembers[0];
            this.outofplaneBendingCapacityRatio = selectedMember.outofplaneBendingCapacityRatio * 100;
            this.inplaneBendingCapacityRatio = selectedMember.inplaneBendingCapacityRatio * 100;
            this.outofplaneDeflectionCapacityRatio = selectedMember.outofplaneDeflectionCapacityRatio * 100;
            this.inplaneDeflectionCapacityRatio = selectedMember.inplaneDeflectionCapacityRatio * 100;
            let members = this.unified3DModel.ModelInput.Geometry.Members.filter(x => x.MemberID == selectedMember.memberID);
            if (members && members.length == 1) {
              let member = members[0];
              this.isTransom = false;
              //1: Outer Frame, 2: Mullion, 3: transom,  4: Facade Major Mullion, 5: Facade Transom, 6 Facade Minor Mullion
              // 21:UDC Top Frame; 22: UDC Vertical Frame;  23: UDC Bottom Frame; 24: UDC Vertical Glazing Bar; 25: UDC Horizontal Glazing Bar;
              switch (member.MemberType) {
                case 21:
                  this.memberName = 'Top Frame'; //this.translate.instant(_('configure.framing'));
                  // [TRANS_TODO] Top Frame
                  this.isTransom = true;
                  break;
                case 22:
                  this.memberName = 'Vertical Frame'; //this.translate.instant(_('result.mullion'));
                  this.isTransom = true;
                  // [TRANS_TODO] Vertical Frame
                  break;
                case 23:
                  this.memberName = 'Bottom Framing'; //this.translate.instant(_('result.transom'));
                  this.isTransom = true;
                  // [TRANS_TODO] Bottom Framing
                  break;
                case 24:
                  this.memberName = 'Vertical Glazing Bar'; //this.translate.instant(_('result.facade-major-mullion'));
                  this.isTransom = true;
                  // [TRANS_TODO] Vertical Glazing Bar
                  break;
                case 25:
                  this.memberName = 'Horizontal Glazing Bar'; //this.translate.instant(_('result.facade-transom'));
                  // [TRANS_TODO] Horizontal Glazing Bar
                  break;
              }
              if (this.unified3DModel.ModelInput.Geometry.FacadeSections !== null) {
                let sections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(x => x.SectionID == member.SectionID);
                if (sections && sections.length == 1) {
                  this.articleId = sections[0].ArticleName;
                  this.articleImgUrl = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/' + this.articleId + '.jpg';
                }
              }
            }
          }
        }
    }
  }
}
