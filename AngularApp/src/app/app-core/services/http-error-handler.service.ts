import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs/index';
import { Router } from '@angular/router';
import { ErrorType } from 'src/app/app-common/data/error-type.enum';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, result?: T, suppressError?: boolean) => (error: HttpErrorResponse) => Observable<T>;


/** Handles HttpClient errors */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandler {

  private errorPageSubject$: Subject<ErrorType> = new Subject();


  constructor(
    private router: Router,
  ) { }

  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
    (operation = 'operation', result = {} as T, suppressError?: boolean) => this.handleError(serviceName, operation, result, suppressError);

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', result = {} as T, suppressError?: boolean) {

    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      /* we need to check the types of errors and depending on that we will perform different operations,
       * for now only the 401 --> Unauthorized error code will be handled
      */

      if (error.status === ErrorType.Unauthorized) {
        // the 401 errors will redirect the app to the login page /Account/Login?returnUrl=
        const currentLocation = window.location;
        const url = '/Account/Login?returnUrl=' + currentLocation.pathname;
        const encodedUrl = encodeURI(url);
        const origin = currentLocation.origin;
        const composedUrl = origin + encodedUrl;
        document.location.assign(composedUrl);
      } else if (suppressError !== true) {
        if (error.status === ErrorType.BadRequest) {
          this.showErrorPage(ErrorType.BadRequest);
        } else if (error.status === ErrorType.Forbidden) {
          this.showErrorPage(ErrorType.Forbidden);
        } else if (error.status === ErrorType.NotFound) {
          this.showErrorPage(ErrorType.NotFound);
        } else if (error.status === ErrorType.InternalServerError) {
          this.showErrorPage(ErrorType.InternalServerError);
        }
      }

      const message = (error.error instanceof ErrorEvent) ?
        error.error.message :
        `server returned code ${error.status} with body "${error.error}"`;

      // Let the app keep running by returning a safe result.
      //return of(result);
      return throwError(result);
    };
  }

  showErrorPage(erroType: ErrorType): void {
    this.errorPageSubject$.next(erroType);
  }

  errorPageChanged(): Observable<ErrorType> {
    return this.errorPageSubject$.asObservable();
  }
}
