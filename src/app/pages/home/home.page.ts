import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { NewArrivalsComponent } from '../../components/new-arrivals/new-arrivals.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, NewArrivalsComponent],
  templateUrl: './home.page.html'
})
export class Home { }