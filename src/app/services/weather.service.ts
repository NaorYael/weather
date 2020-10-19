import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private baseURL = 'https://dataservice.accuweather.com';
  private API_KEY = 'i6B27GqxrNx9QWMb9TOdkH5dA3msKcAe';

  myWeathers: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private httpClient: HttpClient) {
  }


  add(...favCity: any[]) {
    let temp: any[] = [];
    this.myWeathers.subscribe(arr => temp = arr);
    this.myWeathers.next([...temp, ...favCity]);
  }

  getRequest(url, q?) {
    const params = new HttpParams({fromObject: {apikey: this.API_KEY, q, metric: 'true'}});
    return this.httpClient.get(url, {params});
  }

  getGeoPosition(lat: number, lon: number): Observable<any> {
    const url = `${this.baseURL}/locations/v1/cities/geoposition/search`;
    return this.getRequest(url, `${lat},${lon}`).pipe(
      // tap(data => console.log(data)),
      catchError(err => this.handleError(err))
    );
  }

  getAutoComplete(key: string): Observable<any> {
    const url = `${this.baseURL}/locations/v1/cities/autocomplete`;
    return this.getRequest(url, `${key}`).pipe(
      // tap(data => console.log(data)),
      catchError(err => this.handleError(err))
    );
  }

  get5DaysOfForecasts(key: string): Observable<any> {
    const url = `${this.baseURL}/forecasts/v1/daily/5day/${key}`;
    return this.getRequest(url).pipe(
      // tap(data => console.log(data)),
      catchError(err => this.handleError(err))
    );
  }


  getCurrentConditions(key: string): Observable<any> {
    const url = `${this.baseURL}/currentconditions/v1/${key}`;
    return this.getRequest(url).pipe(
      // tap(data => console.log(data)),
      catchError(err => this.handleError(err))
    );
  }

  private handleError(res: HttpErrorResponse) {
    // console.log(res);
    return throwError(res.error || 'Server error');
  }


}
