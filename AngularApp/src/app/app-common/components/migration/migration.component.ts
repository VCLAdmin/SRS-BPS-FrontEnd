import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { DownloadService } from 'src/app/app-layout/services/download.service';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { CommonService } from '../../services/common.service';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-migration',
  templateUrl: './migration.component.html',
  styleUrls: ['./migration.component.css']
})
export class MigrationComponent implements OnInit {
  showLoader = false;
  labelNotification = "";
  migrationResult: any[];
  listOfData: any[];
  successRecords = 0;
  failedRecords = 0;
  downloadUnifiedModel: any;

  constructor(private navLayoutService: NavLayoutService, private sanitizer: DomSanitizer,
    private router: Router, private downloads: DownloadService,
    private commonService: CommonService,
    private homeService: HomeService) { }

  ngOnInit(): void {
    this.migrationResult = [];
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(false);
     ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
   this.navLayoutService.changeNavBarSettings(false,true,false)
  }
  goBackHome() {
    this.router.navigate(['/home']);
  }
  migrate(event: boolean) {
    this.successRecords = 0;
    this.failedRecords = 0;
    this.migrationResult = [];
    this.showLoader = true;
    if (event) {
      this.labelNotification = "Started Migrating to V2";
      this.homeService.MigrateUnifiedModelToV2()
        .subscribe(data => {
          this.listOfData = data;
          this.migrationResult = data;
          this.successRecords = data.filter(f => f.Success).length;
          this.failedRecords = data.filter(f => !f.Success).length;
          this.showLoader = false;
          this.labelNotification = "Done Migrating UnifiedModel To V2";
        })
    } else {
      this.showLoader = false;
      this.labelNotification = "Migration Canceled";
    }
  }
  show(event: string) {
    this.migrationResult = [];
    if (event === 'All') { this.migrationResult = this.listOfData; }
    else if (event === 'Failed') { this.migrationResult = this.listOfData.filter(f => !f.Success); }
    else if (event === 'Success') { this.migrationResult = this.listOfData.filter(f => f.Success); }
  }

  onDownloadButtonClick(jsonString: string, problemId: number) {
    let theJSON = JSON.stringify(jsonString);
    let blob = new Blob([theJSON], { type: 'text/json' });
    let url = window.URL.createObjectURL(blob);
    let uri: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    this.downloadUnifiedModel = uri;
    this.downloads
      .download(this.downloadUnifiedModel.changingThisBreaksApplicationSecurity)
      .subscribe(blob => saveAs(blob, problemId + '_UnifiedModel.json'))
  }
}
