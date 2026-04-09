import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionMailOutline, ionLogoInstagram, ionLogoFacebook, ionLogoTwitter } from '@ng-icons/ionicons';
import { ɵEmptyOutletComponent } from "@angular/router";

type FooterLink = {
    label: string;
    href: string;
};

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [NgIcon, ɵEmptyOutletComponent],
    providers: [provideIcons({ ionMailOutline, ionLogoInstagram, ionLogoFacebook, ionLogoTwitter })],
    templateUrl: './footer.component.html',
})
export class FooterComponent {
    currentYear = new Date().getFullYear();

    quickLinks: FooterLink[] = [
        { label: 'Home', href: '#' },
        { label: 'Shop', href: '#' },
        { label: 'About Us', href: '#' },
        { label: 'Contact', href: '#' },
    ];

    customerServiceLinks: FooterLink[] = [
        { label: 'Contact Us', href: '#' },
        { label: 'Shipping & Returns', href: '#' },
        { label: 'FAQs', href: '#' },
        { label: 'Privacy Policy', href: '#' },
    ];
}