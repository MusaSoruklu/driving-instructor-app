import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Instructor } from './models/instructor';

export interface CartItem {
  instructor: Instructor;
  date: Date;
  start: string;
  end: string;
  price: number;
  duration: number;
  transmission: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.items);

  addToCart(item: CartItem): void {
    this.items.push(item);
    this.itemsSubject.next(this.items);
  }

  removeFromCart(item: CartItem): void {
    const index = this.items.findIndex(i => 
      i.instructor._id === item.instructor._id &&
      i.date === item.date &&
      i.start === item.start &&
      i.end === item.end
    );
    if (index !== -1) {
      this.items.splice(index, 1);
      this.itemsSubject.next(this.items);
    }
  }

  getItems(): Observable<CartItem[]> {
    return this.itemsSubject.asObservable();
  }

  clearCart(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
  }

  saveCartState() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
  
}
