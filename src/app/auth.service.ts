import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, User, Auth } from '@angular/fire/auth';
import { getFirestore, doc, setDoc } from '@angular/fire/firestore';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  role: string;
  name?: string; // Optional
  phone?: string; // Optional
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData$: Observable<User | null>;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private http: HttpClient,
    private auth: Auth
  ) {
    this.auth = getAuth();
    this.userData$ = new Observable(subscriber => onAuthStateChanged(this.auth, subscriber));
  }

  async SignIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);

      this.ngZone.run(() => {
        this.router.navigate(['dashboard']);
      });
    } catch (error) {
      if (error instanceof Error) {
        window.alert(error.message);
      } else {
        window.alert('An error occurred.');
      }
    }
  }


  async SignUp(email: string, password: string, name: string, phone: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      if (userCredential.user) {
        // Create user document in Firestore
        await this.createUserDocument(userCredential.user.uid, name, phone);

        // Navigate to the desired route on successful sign up
        this.ngZone.run(() => {
          this.router.navigate(['']); // Update the route as needed
        });
      } else {
        throw new Error('User object is null');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUserDocument(uid: string, name: string, phone: string) {
    const functions = getFunctions();
    // connect to the emulator if necessary
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    const createUserDocumentFunction = httpsCallable(functions, 'createUserDocument');
    try {
      await createUserDocumentFunction({ uid, name, phone });
      console.log("User document created successfully");
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }

  async setCustomUserClaims(email: string, name: string, phone: string) {
    
    const functions = getFunctions();
    connectFunctionsEmulator(functions, 'localhost', 5001);
    const setCustomUserClaimsFunction = httpsCallable(functions, 'setCustomUserClaims');
    try {
      await setCustomUserClaimsFunction({ email, name, phone });
      console.log("Custom claims set successfully");
    } catch (error) {
      console.error("Error setting custom claims:", error);
    }
  }

  // Common error handling method
  private handleError(error: any) {
    if (error instanceof Error) {
      window.alert(error.message);
    } else {
      window.alert('An error occurred.');
    }
  }

  async ForgotPassword(passwordResetEmail: string) {
    try {
      await sendPasswordResetEmail(getAuth(), passwordResetEmail);
      window.alert('Password reset email sent, check your inbox.');
    } catch (error) {
      if (error instanceof Error) {
        window.alert(error.message);
      } else {
        window.alert('An error occurred.');
      }
    }
  }

  get isLoggedIn(): boolean {
    let loggedIn = false;
    this.userData$.subscribe(user => loggedIn = !!user && user.emailVerified);
    return loggedIn;
  }

  async SignOut() {
    await signOut(getAuth());
    this.router.navigate(['sign-in']);
  }

  getCurrentUserId(): Observable<string | null> {
    return this.userData$.pipe(
      map(user => user ? user.uid : null)
    );
  }
}
