// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })

// export class DownloadService {

//   constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

//   download(downloadString: any): Observable<Blob> {
//     let theJSON = JSON.stringify(downloadString);
//     let blob = new Blob([theJSON], { type: 'text/json' });
//     let url = window.URL.createObjectURL(blob);
//     let uri: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(url);

//     return this.http.get(url, {
//       responseType: 'blob'
//     })
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DownloadService {

  constructor(private http: HttpClient) { }

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }
}