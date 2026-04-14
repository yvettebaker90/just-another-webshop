import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact.page.html',
})
export class ContactFormPage {
  isSending = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  async sendEmail(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement | null;

    if (!form) {
      this.messageType = 'error';
      this.message = 'Something went wrong...';
      return;
    }

    this.isSending = true;
    this.message = '';
    this.messageType = '';

    try {
      await emailjs.sendForm(
        'service_2tctss2',
        'template_9gru4sf',
        form,
        'XnlP5-bqppkyWFGVl'
      );

      this.messageType = 'success';
      this.message = 'Thank you for your message!';
      form.reset();
    } catch (error) {
      console.error(error);
      this.messageType = 'error';
      this.message = 'Something went wrong...';
    } finally {
      this.isSending = false;
    }
  }
}