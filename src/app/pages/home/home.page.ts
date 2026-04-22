import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HeroComponent } from '../../components/hero/hero.component';
import { NewArrivalsComponent } from '../../components/new-arrivals/new-arrivals.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, NewArrivalsComponent],
  templateUrl: './home.page.html'
})
export class Home implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Just Another Webshop | Fragrances, Beauty and Curated Essentials');
    this.meta.updateTag({
      name: 'description',
      content: 'Discover fragrances, beauty favorites, and curated essentials at Just Another Webshop.',
    });
  }
}
