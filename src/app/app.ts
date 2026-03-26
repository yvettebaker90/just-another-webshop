import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/product-card/navigation/header.component';
import { FooterComponent } from './components/product-card/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('just-another-webshop');
}
