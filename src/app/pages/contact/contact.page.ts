import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionMailOutline } from '@ng-icons/ionicons';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.css',
  imports: [NgIcon],
  providers: [provideIcons({ ionMailOutline })],
})
export class ContactFormPage implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  isSending = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showSuccessToast = false;
  private successToastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.title.setTitle('Contact Us | Just Another Webshop');
    this.meta.updateTag({
      name: 'description',
      content: 'Get in touch with Just Another Webshop for questions about products, orders, and customer support.',
    });
  }

  async sendEmail(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement | null;

    if (!form) {
      this.messageType = 'error';
      this.message = 'Something went wrong...';
      this.cdr.detectChanges();
      return;
    }

    this.isSending = true;
    this.message = '';
    this.messageType = '';

    try {
      const emailjs = await import('@emailjs/browser');

      await emailjs.default.sendForm(
        'service_2tctss2',
        'template_9gru4sf',
        form,
        'XnlP5-bqppkyWFGVl'
      );

      this.messageType = 'success';
      this.message = 'Thank you for your message!';
      this.showTemporarySuccessToast();
      form.reset();
    } catch (error) {
      console.error(error);
      this.messageType = 'error';
      this.message = 'Something went wrong...';
      this.cdr.detectChanges();
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
  }

  private showTemporarySuccessToast(): void {
    this.showSuccessToast = true;

    if (this.successToastTimeoutId) {
      clearTimeout(this.successToastTimeoutId);
    }

    this.successToastTimeoutId = setTimeout(() => {
      this.showSuccessToast = false;
      this.successToastTimeoutId = null;
      this.cdr.detectChanges();
    }, 3500);

    this.cdr.detectChanges();
  }
}
