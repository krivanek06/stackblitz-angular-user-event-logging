import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable, Provider } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserEventTrackerService } from './user-event-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class UserEventLoggingInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const trackingService = inject(UserEventTrackerService);

    return next.handle(req).pipe(
      tap((event) => {
        // ignore api calls to the logger
        if (req.url.includes('log')) {
          return;
        }

        // ignore asset images
        if (req.url.includes('assets/images')) {
          return;
        }

        if (event.type === HttpEventType.Sent) {
          trackingService.userEventChange$.next({
            type: 'apiCall',
            url: req.urlWithParams,
          });
        } else if (event.type === HttpEventType.Response) {
          trackingService.userEventChange$.next({
            type: 'apiResponse',
            url: req.urlWithParams,
            status: event.status,
          });
        }
      }),
    );
  }
}

export const userEventLoggingInterceptorProvider: Provider = {
  multi: true,
  provide: HTTP_INTERCEPTORS,
  useClass: UserEventLoggingInterceptor,
};
