import { Component } from '@angular/core';

type FooterLink = {
    label: string;
    href: string;
};

@Component({
    selector: 'app-footer',
    standalone: true,
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