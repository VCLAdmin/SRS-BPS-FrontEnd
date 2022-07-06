import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { LoginService } from '../../services/login.service';
import { Account } from '../../models/account';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/app-core/services/auth.service';
import { first, takeUntil } from 'rxjs/operators';
import { CommonService } from '../../services/common.service';
import { Subject } from 'rxjs';
import { AppconstantsService } from '../../services/appconstants.service';
import { SchecoDecyptedToken } from 'src/app/app-core/models/schecoDecyptedToken';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  username = '';//'Administrator@vcldesign.com';
  password = '';//'bps2019!';
  checkedTnC = false;
  language: string = '';
  showLoader: boolean = false;
  InvalidUserContainer: boolean = false;
  SSOEmailMissing: boolean = false;
  constructor(private navLayoutService: NavLayoutService, private loginService: LoginService,
    private localStorageService: LocalStorageService, private translate: TranslateService,
    private router: Router, private authService: AuthService, private commonService: CommonService,private appConstantService: AppconstantsService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(false);
    ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
   this.navLayoutService.changeNavBarSettings(false,false,false)
    if (this.appConstantService.APP_DOMAIN.indexOf('apiweb.vcldesign') !== -1)
      this.localStorageService.setValue('culture', 'de-DE');
    else 
    this.localStorageService.setValue('culture', 'en-US');
   this.language = (this.localStorageService.getValue('culture')) ? this.localStorageService.getValue('culture') : 'en-US';
    if (!this.localStorageService.hasKey('culture')) {
      this.localStorageService.setValue<string>('culture', this.language);
    }
    this.activatedRoute.queryParams.subscribe(params => {
      debugger;
      this.onLogin();
      debugger;
    });
    // if (this.localStorageService.hasKey('culture')) {
    //   this.language = this.localStorageService.getValue('culture');
    // }
    // else {
    //   this.language = 'en-US';
    //   this.localStorageService.setValue<string>('culture', this.language);
    // }
    setTimeout(() => {
      this.translate.use(this.language);
    },200);
  }
  onLogin() {
    this.showLoader = true;
    this.InvalidUserContainer = false;
    //BPS SSO
    var sToken = "DE3FAC5557BFEAB4F8E8CA25E42850D5E5039F0DAB4B982A88DD862B0E35FB3B95A264DE2AF736EC02E66BBA488D5493E61E240B3769EBE4741B46704B63C134A4B2A7C523D48C113ED2218CE98EE18A9C9DB0AFA9881170868B7C9E6B337DAB698BADDDFA0AFB6D3612957E4A4366E0A788FBFE78FE306A5E6CB2E36C0F1FFFBCFD8E603C4E2992A482846C83E5665A715E669384D23223E6703492EC7E8824BDE3AA5810198489766A123D86CCD03EA5A7D44FE3D01CB3499032981EFA19218EF3FA99885E3BBB8A3694AAF270C713753D7C5DBEE60A31C346CE7C28445247563878D62468F7DB59CBB9E927FCCB4035933D427CC1AE1F925467D5E30774E8";
    var defaultPassword = "4nEX25CjFvQw8bOjB59Y3xuA9Tnv5j!";
    var userEmail = "";
    this.authService.loginTokenSSO(sToken).pipe(first()).subscribe((result: SchecoDecyptedToken)=>{
      userEmail = result.email;
      if(userEmail == "Validationfailed")
      {
        this.showLoader = false;
        this.SSOEmailMissing = true;
        return;
      }
      this.authService.login(result.email, defaultPassword).pipe(first()).subscribe((result: any) => {
        let currentAccount: Account = new Account(userEmail, defaultPassword, this.language);
        this.loginService.SignIn(currentAccount).pipe(takeUntil(this.destroy$)).subscribe((user) => {
          if (user && user.UserGuid) {
            this.commonService.setUserGuid(user.UserGuid);
            this.loginService.currentUser = user; // are we using this code ???
            currentAccount.User = user;
          //
            this.commonService.resetUser(JSON.stringify(currentAccount.User));
            this.showLoader = false;
            this.router.navigate(['/home/'])
          //
            // this.loginService.ValidateHash(currentAccount).pipe(takeUntil(this.destroy$)).subscribe((isValid: boolean) => {
            //   if (isValid) {
            //     this.commonService.resetUser(JSON.stringify(currentAccount.User));
            //     this.showLoader = false;
            //     this.router.navigate(['/home']);
            //     //isAuthentificated = true;
            //   }
            // }, error => {
            //   this.showLoader = false;
            // });
          } else {
            this.showLoader = false
            this.username = '';
            this.password = '';
            this.checkedTnC = false;
          }
        }, error => {
          this.showLoader = false;
          this.InvalidUserContainer = true;
        });
      }, error => {
        this.showLoader = false;
        this.InvalidUserContainer = true;
      });
    });
  }

  onChangeLanguage(language: string) {
    this.language = language;
    this.localStorageService.setValue<string>('culture', language);
    this.translate.use(language);
  }
}
