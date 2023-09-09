import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Instructor } from './models/instructor';
import { HttpClient } from '@angular/common/http';


export interface CartItem {
  _id: string;
  instructor: Instructor;
  date: Date;
  start: string;
  end: string;
  price: number;
  duration: number;
  transmission: string;
  pickupPoint?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.items);
  private API_URL = 'https://your-backend-url/api/cart';
  constructor(private http: HttpClient) {
    // Load saved cart state from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') ?? '[]');
    if (savedCart) {
      this.items = savedCart;
      this.itemsSubject.next(this.items);
    }
  }

  addToCart(item: CartItem): void {
    this.http.post<CartItem>(this.API_URL, item).subscribe(
      (responseItem: CartItem) => {
        // Assuming the response includes the created item
        this.items.push(responseItem);
        this.itemsSubject.next(this.items);
        // Note: You may or may not need local storage now since the backend tracks cart items
        this.saveCartState();
      },
      error => {
        console.error("Error adding cart item:", error);
      }
    );
  }

  removeFromCart(item: CartItem): void {
    const itemID = item._id; // Assuming you have an _id property now
    this.http.delete(`${this.API_URL}/${itemID}`).subscribe(
        () => {
            const index = this.items.findIndex(i => i._id === itemID);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.itemsSubject.next(this.items);
                // Note: You may or may not need local storage now since the backend tracks cart items
                this.saveCartState();
            }
        },
        error => {
            console.error("Error removing cart item:", error);
        }
    );
}


  getItems(): Observable<CartItem[]> {
    return this.itemsSubject.asObservable();
  }

  clearCart(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
    this.saveCartState();
  }

  saveCartState() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
}