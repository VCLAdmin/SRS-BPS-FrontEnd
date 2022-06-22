import { Injectable } from '@angular/core';
import { AppconstantsService } from './appconstants.service';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/app-common/models/user';
import { Account } from 'src/app/app-common/models/account';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  currentUser: User = new User();

  constructor(private appConstantService: AppconstantsService, private http: HttpClient) { }

  SignIn(account): Observable<User> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/AccountPrevious/SignIn";
    return this.http.post<User>(url, account);
  }
  ValidateHash(account: Account): Observable<boolean> {
    //let url: string = this.appConstantService.APP_DOMAIN + "api/AccountPrevious/ValidateHash";
    //return this.http.post<boolean>(url, account);
    var subject = new Subject<boolean>();
    subject.next(true);
    return subject.asObservable();
  }
  GetVersionInformation(): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/AccountPrevious/GetVersionInformation";
    return this.http.get<any>(url);
  }
}