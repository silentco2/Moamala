import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';
import { RequestDetail, RequestType, ServiceRequest } from '@moamala/shared/models';
import { isObservable, Observable } from 'rxjs';
import { requestDetailResolver } from './request-detail.resolver';

describe('requestDetailResolver', () => {
  it('T2.6 resolves the request with its type, audit events and users', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const httpMock = TestBed.inject(HttpTestingController);
    const route = {
      paramMap: convertToParamMap({ id: 'req-7' }),
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      requestDetailResolver(route, {} as RouterStateSnapshot),
    );
    expect(isObservable(result)).toBe(true);
    let detail: RequestDetail | undefined;
    (result as Observable<RequestDetail>).subscribe((value) => (detail = value));

    const request = { id: 'req-7', typeId: 'rt-2' } as ServiceRequest;
    httpMock.expectOne('/api/requests/req-7').flush(request);
    httpMock.expectOne('/api/requests/req-7/audit').flush([]);
    httpMock.expectOne('/api/users').flush([]);
    httpMock.expectOne('/api/request-types/rt-2').flush({ id: 'rt-2' } as RequestType);

    expect(detail).toEqual({ request, type: { id: 'rt-2' }, events: [], users: [] });
  });
});
