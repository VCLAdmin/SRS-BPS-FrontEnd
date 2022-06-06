import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfigureService } from "./app-structural/services/configure.service";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "AngularApp";
  value: string;
  selectedValue: string;
  constructor(
    private configureService: ConfigureService,
    private translate: TranslateService,
  ) {
    translate.setDefaultLang(this.configureService.getLanguage());
  }
  ngOnInit() {
    // this.authService.login();
  }

  log($event) {
  }
}
