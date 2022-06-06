import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import { AuthService } from '../services/auth.service';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private appConstantService: AppconstantsService,
    private auth: AuthService,
    private route: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service.
    const authToken = this.auth.getAuthorizationToken();
    const authPCToken = this.auth.getAuthorizationPCToken();
    const authBasicPCToken = 'Basic ' + btoa(this.appConstantService.PHYSICS_CORE_CLIENTID + ':' + this.appConstantService.PHYSICS_CORE_CLIENTSECRET);

    // Clone the request and set the new header in one step.
    let authReq: any;
    const is_PC_ApiUrl = req.url.startsWith(this.appConstantService.PHYSICS_CORE_DOMAIN);
    if (req.url.includes("amazonaws.com") && req.method === "PUT") {
      authReq = req;
    } else if (is_PC_ApiUrl) {
      // New PC Login
      authReq = req.clone({ setHeaders: { Authorization: authBasicPCToken } });
      // Old PC Login
      // if (req.url.startsWith(this.appConstantService.PHYSICS_CORE_DOMAIN + 'api/Account/Login'))
      //   authReq = req.clone({ setHeaders: { Authorization: authBasicPCToken } });
      // else
      //   authReq = req.clone({ setHeaders: { Authorization: authPCToken } });
    } else {
      authReq = req.clone({ setHeaders: { Authorization: authToken } });
    }

    // send cloned request with header to the next handler.
    return next.handle(authReq).pipe(tap(() => { },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }
          this.auth.logOut();
        }
      }
    ));
  }
}
