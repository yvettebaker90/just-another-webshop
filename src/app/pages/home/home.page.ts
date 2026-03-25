import { Component } from '@angular/core';

import { ProductCardsComponent } from '../../components/product-card/product-card.component';
import { SupabaseTestComponent } from '../../components/supabase-test/supabase-test.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardsComponent, SupabaseTestComponent],
  templateUrl: './home.page.html'
})
export class Home {}