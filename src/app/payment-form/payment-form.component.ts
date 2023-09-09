import { Component, AfterViewInit } from '@angular/core';

declare var Stripe: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements AfterViewInit {

  stripe: any;
  items = [{ price: "price_1Nl0EUFzf8DCq6lRRwdkZpRe", amount: 1 }];
  emailAddress = '';
  elements: any;

  ngAfterViewInit() {
    this.stripe = Stripe("pk_test_oLSXBj8l1nRuXlTenYYo6Ahw");
    this.initialize();
    this.checkStatus();
    document
      .querySelector("#payment-form")!
      .addEventListener("submit", this.handleSubmit.bind(this));
  }

  async initialize() {
    const response = await fetch("http://localhost:3000/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: this.items }),
    });
    const { clientSecret } = await response.json();
    const appearance = {
      theme: 'stripe',
    };
    this.elements = this.stripe.elements({ clientSecret, appearance });

    const linkAuthenticationElement = this.elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    linkAuthenticationElement.on('change', (event: any) => {
      this.emailAddress = event.value.email;
    });

    const paymentElementOptions = {
      layout: "tabs",
    };

    const paymentElement = this.elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    this.setLoading(true);

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: "http://localhost:4200/checkout.html",
        receipt_email: this.emailAddress,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      this.showMessage(error.message);
    } else {
      this.showMessage("An unexpected error occurred.");
    }

    this.setLoading(false);
  }

  async checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    const { paymentIntent } = await this.stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
      case "succeeded":
        this.showMessage("Payment succeeded!");
        break;
      case "processing":
        this.showMessage("Your payment is processing.");
        break;
      case "requires_payment_method":
        this.showMessage("Your payment was not successful, please try again.");
        break;
      default:
        this.showMessage("Something went wrong.");
        break;
    }
  }

  showMessage(messageText: string) {
    const messageContainer = document.querySelector("#payment-message")!;

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add("hidden");
      messageContainer.textContent = "";
    }, 4000);
  }

  setLoading(isLoading: boolean) {
    const submitButton = document.querySelector("#submit") as HTMLButtonElement;
    const spinner = document.querySelector("#spinner");
    const buttonText = document.querySelector("#button-text");

    if (isLoading) {
      submitButton.disabled = true;
      spinner?.classList.remove("hidden");
      buttonText?.classList.add("hidden");
    } else {
      submitButton.disabled = false;
      spinner?.classList.add("hidden");
      buttonText?.classList.remove("hidden");
    }
  }
}
