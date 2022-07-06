import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { LocalStorageService } from './local-storage.service';
import { WindowRefService } from './window-ref.service';
import { HttpErrorHandler, HandleError } from './http-error-handler.service';
import { HttpClient } from '@angular/common/http';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { SchecoDecyptedToken } from '../models/schecoDecyptedToken';

const userDataKey = 'current_User';

/** Mock client-side authentication/authorization service */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  protected handleError: HandleError;

  constructor(
    private appConstantService: AppconstantsService,
    private localStorageService: LocalStorageService,
    private windowRef: WindowRefService,
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler
  ) {
    this.handleError = httpErrorHandler.createHandleError('Service');
  }

  getAuthorizationToken() {
    if (this.windowRef.nativeWindow['AuthenticationToken'] === undefined){
      const token = this.localStorageService.getAuthToken();
      if (token === undefined || token.access_token === "")
        return "";
      else 
        return 'Bearer ' + token.access_token;
    }
    else
      return 'Bearer ' + this.windowRef.nativeWindow['AuthenticationToken'].access_token;
  }

  setAuthorizationToken(accessToken: any): void {
    this.windowRef.nativeWindow['AuthenticationToken'] = accessToken;
    const currentToken = this.localStorageService.getAuthToken();
    currentToken.access_token = accessToken.access_token;
    currentToken.refresh_token = accessToken.refresh_token;
    currentToken.expires_in = accessToken.expires_in;
    this.localStorageService.removeValue("auth-token");
    this.localStorageService.setAuthToken(currentToken);
  }
  getAuthorizationPCToken() {
    if(this.windowRef.nativeWindow['AuthenticationPCToken'] === undefined) {
      const token = this.localStorageService.getAuthPCToken();
      if (token === undefined || token.access_token === "")
        return  'Basic ' + btoa(this.appConstantService.PHYSICS_CORE_CLIENTID + ':' + this.appConstantService.PHYSICS_CORE_CLIENTSECRET);
      else 
        return 'Bearer ' + token.access_token;
    }      
    else
      return 'Bearer ' + this.windowRef.nativeWindow['AuthenticationPCToken'].access_token;
  }

  setAuthorizationPCToken(accessToken: any): void {
    this.windowRef.nativeWindow['AuthenticationPCToken'] = accessToken;
    const currentToken = this.localStorageService.getAuthPCToken();
    currentToken.access_token = accessToken.access_token;
    currentToken.refresh_token = accessToken.refresh_token;
    currentToken.expires_in = accessToken.expires_in;
    this.localStorageService.removeValue("auth-pc-token");
    this.localStorageService.setAuthPCToken(currentToken);
    // location.reload(true);
  }

  setCurrentUserData<TModel>(user: TModel) {
    this.localStorageService.setValue<TModel>(userDataKey, user);
  }

  getCurrentUserData(): User {
    const user: User = JSON.parse(this.localStorageService.getValue(userDataKey));
    return user !== null ? user :
      new User('', '', '', '', '', '', '', '', '', '', '', '',
        false, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', [], '', '', false, '');
  }

  logOut(): void {
    this.localStorageService.clearLocalStorage();
    this.localStorageService.removeAuthPCToken();
    this.localStorageService.removeAuthToken();
    location.href = '/Account/LogOut';
  }

  login(username: string, password: string): Observable<boolean> {
    //const requestBody = 'grant_type=password&username=' + username + '&password=' + password;
    const requestBody =
    {
      UserName: username,
      Password: password,
      Language: "en-US",
      User: null
    };
    return this.http.post<any>(this.appConstantService.APP_DOMAIN + "api/Account/login", requestBody)
    .pipe(map(data => {
        this.setAuthorizationToken(data);
        // this.setPCToken().pipe(first()).subscribe((result: any)=>{
        // });
        return true;
    }));
  }

  loginTokenSSO(schuecoToken: string): Observable<SchecoDecyptedToken> {
    return this.http.get<SchecoDecyptedToken>(this.appConstantService.APP_DOMAIN + "api/account/logintoken?token=" + schuecoToken);
  }
  
  // setPCToken(): Observable<boolean> {
  //   return this.http.post<any>(`${this.appConstantService.PHYSICS_CORE_DOMAIN}api/Account/Login`, 'grant_type=client_credentials')
  //       .pipe(map(data => {
  //           this.setAuthorizationPCToken(data);
  //           return true;
  //       }));
  // }
  
  // public bpsServiceCheck() {
  //   var x = new XMLHttpRequest();
  //   x.timeout = 15000;
  //   x.open('GET', `${this.appConstantService.PHYSICS_CORE_DOMAIN}api/Account/Login`);
  //   x.onreadystatechange = function () {
  //     if (this.readyState == 4) {
  //       if (this.status == 200) {
  //         console.log('url exists PHYSICS_CORE_DOMAIN');
  //       } else {
  //         console.log('url does not exist PHYSICS_CORE_DOMAIN');
  //       }
  //     }
  //   }
  //   x.send();
  // }

}
