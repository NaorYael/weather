import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {WeatherService} from '../services/weather.service';
import {AutoCompleteSuggestions} from '../model/auto-complete-suggestions';
import {DailyForecast, FiveDaysForecast} from '../model/5-days-forecast';
import {GeoPositionRes} from '../model/geo-position';
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit, OnDestroy {

  DEFAULT_LAT = 32.0853;
  DEFAULT_LON = 34.7818;

  autoCompleteInput = new Subject();
  autoCompleteValue;
  autoCompletedSuggestions: AutoCompleteSuggestions[];
  cityName: string;
  headLine: string;
  forecasts: DailyForecast[];
  selectedKey: any;

  ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private weatherService: WeatherService) {
  }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        this.weatherService.getGeoPosition(latitude, longitude).subscribe((data: GeoPositionRes) => {
          this.handleInitPosition(data);
        });
      });
    } else {
      this.weatherService.getGeoPosition(this.DEFAULT_LAT, this.DEFAULT_LON).subscribe((data: GeoPositionRes) => {
        this.handleInitPosition(data);
      });
    }


    this.autoCompleteInput
      .pipe(
        filter((data: string) => data.length > 0),
        takeUntil(this.ngUnSubscribe),
        debounceTime(300),
        switchMap((data: string) => {
          return this.weatherService.getAutoComplete(data);
        })
      )
      .subscribe((suggestions: AutoCompleteSuggestions[]) => {
        this.autoCompletedSuggestions = suggestions;
      });
  }

  selectSuggestion(suggestion: AutoCompleteSuggestions) {
    this.cityName = `${suggestion.LocalizedName},${suggestion.Country.LocalizedName}`;
    this.autoCompleteValue = this.cityName;
    this.getFiveDays(suggestion.Key);
    this.autoCompletedSuggestions = null;
  }


  private handleInitPosition(geoPositionRes: GeoPositionRes) {
    this.cityName = `${geoPositionRes.Country.EnglishName}`;
    // this.cityName = `${geoPositionRes.ParentCity.EnglishName},${geoPositionRes.Country.EnglishName}`;
    this.getFiveDays(geoPositionRes.Key);
  }


  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }


  getFiveDays(key) {
    this.selectedKey = key;
    this.weatherService.get5DaysOfForecasts(key).subscribe((fiveDaysForecastData: FiveDaysForecast) => {
      this.headLine = fiveDaysForecastData.Headline.Text;
      this.forecasts = fiveDaysForecastData.DailyForecasts;
    });
  }

  toggleFavorites() {
    const selectedCity = {
      key: this.selectedKey,
      cityName: this.cityName,
      headLine: this.headLine,
      temperature: this.forecasts[0].Temperature,
      icon: this.forecasts[0].Day.Icon
    };
    this.weatherService.add(selectedCity);
    let temp: any[] = [];
    this.weatherService.myWeathers.subscribe(arr => temp = arr);
  }

}
