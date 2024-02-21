import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { environment } from '../../environments/environment'; // adjust the import statement to your file structure

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private fns: AngularFireFunctions) {
    if (!environment.production) {
      // Use functions emulator in non-production environment
      this.fns.useEmulator('localhost', 5001); // make sure the host and port match your emulator configuration
    }
  }

  fetchPaymentMethods(uid: string) {
    console.log(this.fns.httpsCallable);
    const callable = this.fns.httpsCallable('paymentMethods');
    return callable({ uid }).toPromise();
  }

  saveCard(uid: string, tokenId: string) {
    const callable = this.fns.httpsCallable('saveCard');
    return callable({ uid: uid, token: tokenId }).toPromise();
  }

  createPaymentIntent(data: { items: any[] }): Promise<{ clientSecret: string }> {
    const callable = this.fns.httpsCallable('createPaymentIntent');
    return callable(data).toPromise();
  }
}
