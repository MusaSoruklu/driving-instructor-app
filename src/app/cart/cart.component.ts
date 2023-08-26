import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../cart.service';
import { Observable } from 'rxjs';
import { faSterlingSign } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignupLoginComponent } from '../signup-login/signup-login.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  faSterlingSign = faSterlingSign;
  items$: Observable<CartItem[]>;

  constructor(private cartService: CartService, private router: Router, public dialog: MatDialog, private authService: AuthService) {
    this.items$ = this.cartService.getItems();
  }

  openSignUpLoginDialog(): void {
    const dialogRef = this.dialog.open(SignupLoginComponent, {
      width: '400px',
      // other configurations if needed
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Navigate to the booking page if the user is authenticated
      // this.router.navigate(['/booking']);
    });
  }

  ngOnInit(): void {
    this.items$ = this.cartService.getItems();
  }

  // navigateToCheckout() {
  //   if (this.authService.isLoggedIn()) { // Assuming you have an AuthService with an isLoggedIn method
  //     this.router.navigate(['/checkout']);
  //   } else {
  //     // Save the current cart state for after registration
  //     this.cartService.saveCartState();
  
  //     // Navigate to the sign-up/login page
  //     this.router.navigate(['/signup']);
  //   }
  // }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }
}