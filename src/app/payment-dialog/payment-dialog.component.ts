import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PaymentService } from '../services/payment.service';
import { UserService } from '../services/user.service';

declare var Stripe: any;

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
  stripe: any;
  elements: any;
  card: any;
  userId: string | null = null;
  activeStep: number = 1;
  paymentMethods: any[] = [];
  lessons = [
    {
      instructorId: "Ylh2ZCFZoaznnW2cg8rE", // Instructor's unique ID
      date: 'Oct 10, 2024',
      time: '10:00 AM',
      location: '12 Church street, N99OP',
      transmissionType: 'Manual',
      duration: 1,  // Changed to integer
      price: 50  // Assuming this is the total price for the slot, adjusted to integer if needed
    },
    // {
    //   instructorId: "Ylh2ZCFZoaznnW2cg8rE",
    //   date: 'Oct 12, 2023',
    //   time: '02:00 PM',
    //   location: '12 Church street, N99OP',
    //   transmissionType: 'Automatic',
    //   duration: 1,
    //   price: 60
    // },
  ];
  confirmedLesson: any = {}; // This will hold the confirmed lesson details

  constructor(private authService: AuthService, private paymentService: PaymentService, private userService: UserService) {
  }

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe(uid => {
      if (uid) {
        this.userId = uid;
        this.fetchPaymentMethods(uid);
      } else {
        console.error('User not authenticated');
      }
    });
    this.initializeStripe();
  }

  fetchPaymentMethods(uid: string): Promise<any> { //make a loading spinner in dialog when we are fetching this
    return this.paymentService.fetchPaymentMethods(uid)
      .then(response => {
        console.log(response);
        this.paymentMethods = response.data as any[];
        console.log(this.paymentMethods);
        if (this.paymentMethods && this.paymentMethods.length > 0) {
          this.selectedMethod = { type: 'card', index: 0 };
        }
      })
      .catch(error => {
        console.error('Failed to fetch payment methods:', error);
        // Propagate the error to be caught in the next catch() block in the promise chain
        return Promise.reject(error);
      });
  }

  initializeStripe() {
    this.stripe = Stripe('pk_test_oLSXBj8l1nRuXlTenYYo6Ahw');  // your publishable key
    this.elements = this.stripe.elements();

    let style = {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 400,
        letterSpacing: '0.5px',
      }
    };

    let options = {
      style: style,
      placeholder: 'Card number',
    };

    this.card = this.elements.create('card', options);
    this.card.mount('#card-element');
  }

  setupFocusHandlers() {
    const cardWrapper = document.getElementById('card-number-wrapper');
    const hiddenInput = document.getElementById('card-number-hidden-input');
    if (cardWrapper && hiddenInput) {
      this.card.on('focus', () => {
        cardWrapper.classList.add('focused-border');
      });
      this.card.on('blur', () => {
        cardWrapper.classList.remove('focused-border');
      });
      cardWrapper.addEventListener('click', () => {
        hiddenInput.focus();
        this.card.focus();
      });
    }
  }

  resetSteps() {
    this.activeStep = 1;
  }

  selectedMethod: SelectedMethod = { type: null, index: 0 };
  selectPaymentMethod(type: 'card' | 'klarna', index: number) {
    this.selectedMethod = { type, index };
  }

  onContinueToStep3() {
    if (this.selectedMethod.type === 'card' && this.selectedMethod.index >= 0) {
      this.payAndBook(); // If a card is selected, proceed to payment
    } else {
      this.activeStep = 3;
      setTimeout(() => {
        this.initializeStripe();
        this.setupFocusHandlers();
      });
    }
  }


  get totalHours(): number {
    return 2;
  }
  get buttonText(): string {
    if (this.selectedMethod) {
      if (this.selectedMethod.type === 'klarna') {
        return 'Pay & Book with Klarna';
      } else if (this.selectedMethod.type === 'card' && this.selectedMethod.index >= 0) {
        return 'Pay & Book';
      }
    }
    return 'Add payment card';
  }

  isSubmitting: boolean = false;
  handleSubmit() {
    this.isSubmitting = true;

    this.stripe.createToken(this.card).then((result: { error: { message: string | null; }; token: any; }) => {

      if (result.error) {
        this.isSubmitting = false;
        let errorElement = document.getElementById('card-errors');
        if (errorElement) {
          errorElement.textContent = result.error.message;
        }
      } else {
        console.log(result.token);
        this.sendTokenToServer(result.token);
      }
    });
  }

  sendTokenToServer(token: any) {
    if (!this.userId) return;

    this.paymentService.saveCard(this.userId, token.id)
      .then(() => {
        console.log('Card saved successfully');
        // Return the promise of fetchPaymentMethods to chain then() in the promise chain
        return this.fetchPaymentMethods(this.userId as string);
      })
      .then(() => {
        // Only executed after fetchPaymentMethods has completed successfully
        this.activeStep = 2;
        this.isSubmitting = false;
      })
      .catch((error) => {
        console.error('Failed to save card or fetch methods:', error);
        this.isSubmitting = false;
      });
  }

  async payAndBook() {
    try {
      console.log('Starting payAndBook process');
      this.isSubmitting = true;

      // Check if this.stripe is defined
      console.log('this.stripe:', this.stripe);

      // Ensure the paymentMethods and selectedMethod are valid
      console.log('paymentMethods:', this.paymentMethods, 'selectedMethod:', this.selectedMethod);
      if (!this.paymentMethods || this.selectedMethod.index >= this.paymentMethods.length) {
        console.error('Invalid payment method selected');
        throw new Error('Invalid payment method selected');
      }

      // Log lessons data
      console.log('Lessons:', this.lessons);

      // Step 1: Create a PaymentIntent on the server
      console.log('Creating PaymentIntent on the server');
      const paymentIntent = await this.paymentService.createPaymentIntent({ items: this.lessons });
      console.log('PaymentIntent received:', paymentIntent);

      if (!paymentIntent.clientSecret) {
        console.error('Failed to create PaymentIntent on the server');
        throw new Error('Failed to create PaymentIntent on the server');
      }

      const clientSecret = paymentIntent.clientSecret;

      // Retrieve the payment method ID using the selected index
      const paymentMethodId = this.paymentMethods[this.selectedMethod.index].id;
      console.log('Using paymentMethodId:', paymentMethodId);

      // Step 2: Confirm the PaymentIntent
      console.log('Confirming the PaymentIntent with Stripe');
      const paymentResult = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });
      console.log('Payment result:', paymentResult);

      if (paymentResult.error) {
        console.error('Payment failed', paymentResult.error.message);
        // Handle error and show error message to user
      } else {
        console.log('Payment succeeded', paymentResult.paymentIntent?.id);
        this.onPaymentSuccess(this.lessons[0]); // Assuming the first lesson is the confirmed one
      }
    } catch (error) {
      console.error('Payment processing error', error);
      // Handle error and show error message to user
    } finally {
      this.isSubmitting = false;
    }
  }

  async onPaymentSuccess(lesson: any) {
    this.confirmedLesson = lesson;
    this.activeStep = 4; // Move to confirmation step
  
    // Save the lesson to the user's Firestore lessons field
    if (this.userId) {
      try {
        await this.userService.addLessonToUser(this.userId, lesson);
        console.log('Lesson added to user successfully');
      } catch (error) {
        console.error('Failed to add lesson to user:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  }
  

  showLesson() {
    // Implement logic to show the lesson details or navigate to the lesson page
  }

}

interface SelectedMethod {
  type: 'card' | 'klarna' | null;
  index: number;
}
