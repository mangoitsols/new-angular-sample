import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {KVStorage, TokenStorage} from "@/_services/storage";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private tokenStorage: KVStorage<string>;
  constructor() {
    this.tokenStorage = TokenStorage;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    function applyToken(token: string) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // add authorization header with jwt token if available
    const token = this.tokenStorage.get();
    if (token) {
      request = applyToken(token);
    }

    return next.handle(request);
  }
}
