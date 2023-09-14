import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../cart.service';
import { Observable } from 'rxjs';
import { faSterlingSign } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignupLoginComponent } from '../signup-login/signup-login.component';
import { AuthService } from '../auth.service';
import { take } from 'rxjs/operators';

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
    this.authService.userData$.pipe(take(1)).subscribe(user => {
      if (user) {
        // Navigate to the booking page if the user is authenticated
        this.router.navigate(['/booking']);
      } else {
        const dialogRef = this.dialog.open(SignupLoginComponent, {
          width: '400px',
          // other configurations if needed
        });

        dialogRef.afterClosed().subscribe(() => {
          console.log('The dialog was closed');
          // Navigate to the booking page if the user is authenticated
          if (user) {
            this.router.navigate(['/booking']);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.items$ = this.cartService.getItems();
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }
}