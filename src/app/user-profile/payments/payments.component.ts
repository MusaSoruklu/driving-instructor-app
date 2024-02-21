import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  activeTab: 'methods' | 'history' = 'methods';
  paymentMethods: any[] = [];
  userId: string | null = null;

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe((uid: string | null) => {
      if (uid) {
        this.userId = uid;
        this.fetchPaymentMethods(uid);
      }
    });
  }

  fetchPaymentMethods(uid: string): void {
    this.paymentService.fetchPaymentMethods(uid)
      .then(response => {
        this.paymentMethods = response.data;
      })
      .catch(error => {
        console.error('Failed to fetch payment methods:', error);
      });
  }

  setActiveTab(tab: 'methods' | 'history'): void {
    this.activeTab = tab;
  }
}
