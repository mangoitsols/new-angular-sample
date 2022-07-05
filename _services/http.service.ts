
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PreflightError } from '../_models/preflight-error';
import {HttpHeaders} from '@angular/common/http';

@Injectable()
export class HttpService {
  protected headers = new HttpHeaders();
  protected router: Router;

  constructor() {
    this.headers.append('Content-Type', 'application/json');
  }
  protected handleError(error: Response | any): Observable<PreflightError> {
    // In a real world app, you might use a remote logging infrastructure
    let err: PreflightError;
    if (error instanceof Response) {
      err = { code: error.status, message: error.statusText };
    } else {
      err = error.message ? error.message : error.toString();
    }
    console.error(err);
    return observableThrowError(err);
  }
}
