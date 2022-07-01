import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { LoginService } from '../../services/login.service';
import { Account } from '../../models/account';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/app-core/services/auth.service';
import { first, takeUntil } from 'rxjs/operators';
import { CommonService } from '../../services/common.service';
import { Subject } from 'rxjs';
import { AppconstantsService } from '../../services/appconstants.service';

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
  constructor(private navLayoutService: NavLayoutService, private loginService: LoginService,
    private localStorageService: LocalStorageService, private translate: TranslateService,
    private router: Router, private authService: AuthService, private commonService: CommonService,private appConstantService: AppconstantsService) { }
  
    /**
     * No nav bar and set the language (local storageor english by default)
     */
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

  /**
   * Check the validation of the unsername and password, redirect to home if they are correct
   */
  onLogin() {
    this.showLoader = true;
    this.InvalidUserContainer = false;
    this.authService.login(this.username.trim(), this.password.trim()).pipe(first()).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      let currentAccount: Account = new Account(this.username.trim(), this.password.trim(), this.language);
      this.loginService.SignIn(currentAccount).pipe(takeUntil(this.destroy$)).subscribe((user) => {
        if (user && user.UserGuid) {
          this.commonService.setUserGuid(user.UserGuid);
          this.loginService.currentUser = user; // are we using this code ???
          currentAccount.User = user;
          this.loginService.ValidateHash(currentAccount).pipe(takeUntil(this.destroy$)).subscribe((isValid: boolean) => {
            if (isValid) {
              this.commonService.resetUser(JSON.stringify(currentAccount.User));
              this.showLoader = false;
              this.router.navigate(['/home']);
              //isAuthentificated = true;
            }
          }, error => {
            this.showLoader = false;
          });
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
  }

  /**
   * Save the language on local storage
   * @param language 
   */
  onChangeLanguage(language: string) {
    this.language = language;
    this.localStorageService.setValue<string>('culture', language);
    this.translate.use(language);
  }
}
