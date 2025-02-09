import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserEventTrackerService } from './user-event-tracker.service';

/**
 * listen to http events and log them
 */
export const userEventLoggingInterceptorProvider = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const trackingService = inject(UserEventTrackerService);

  return next(req).pipe(
    tap((event) => {
      // send http event
      if (event.type === HttpEventType.Sent) {
        trackingService.createLog({
          type: 'apiCall',
          url: req.urlWithParams,
        });
      }
      // receive http event
      else if (event.type === HttpEventType.Response) {
        trackingService.createLog({
          type: 'apiResponse',
          url: req.urlWithParams,
          status: event.status,
        });
      }
    }),
  );
};
