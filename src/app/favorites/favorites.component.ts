import {Component, OnDestroy, OnInit} from '@angular/core';
import {WeatherService} from '../services/weather.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  constructor(private weatherService: WeatherService) {
  }

  favArr = [];

  ngOnInit() {
    this.subscription = this.weatherService.myWeathers.subscribe(arr => this.favArr = arr);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
