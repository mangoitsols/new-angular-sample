import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

const ignoredEndpoints = [
  'api/users/bulk-invite',
  'api/aircrafts/bulk-add'
];

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.headers.has('Content-Type') && !this.isUrlIgnored(request)) {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
    }

    request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

    return next.handle(request);
  }

  private isUrlIgnored(request: HttpRequest<any>) {
    return !!ignoredEndpoints.find(url => url === request.url);
  }
}
