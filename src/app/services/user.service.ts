import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { collection, deleteDoc, getDoc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { PickupLocation } from '../models/pickup-location.js';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from '@angular/fire/functions';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) {
    this.firestore = getFirestore();

  }

  async getAddressSuggestions(input: string): Promise<any> {
    console.log("INPUT : " + input);
    const functions = getFunctions();
    // Uncomment the line below if you're using Firebase Emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Ensure the input string is not empty
    if (!input.trim()) {
      return [];
    }

    const getAddressSuggestionsFunction = httpsCallable(functions, 'getAddressSuggestions');
    try {
      // Change here: Pass the 'query' field instead of 'input'
      const result = await getAddressSuggestionsFunction({ query: input });
      console.log(result.data);
      return result.data; // Assuming the function returns an array of suggestions
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      throw error;  // or handle error as appropriate
    }
  }

  async getAddressByCoordinates(lat: number, lng: number): Promise<string> {
    const functions = getFunctions();
    const getAddressByCoordinatesFunction = httpsCallable<{ lat: number, lng: number }, { address: string }>(functions, 'getAddressByCoordinates');

    try {
      const result = await getAddressByCoordinatesFunction({ lat, lng });
      return result.data.address; // Now TypeScript knows result.data has an 'address' property
    } catch (error) {
      console.error('Error fetching address by coordinates:', error);
      throw error;
    }
  }

  async saveUserAddress(userId: string, address: string, coordinates: { lat: number, lng: number }, label: string = ''): Promise<void> {
    // Reference to the subcollection for user's addresses
    const userAddressesRef = collection(this.firestore, `users/${userId}/addresses`);

    try {
      // This will automatically generate a new document reference
      const addressRef = doc(userAddressesRef);
      
      // Now set the document with the provided address data
      await setDoc(addressRef, {
        address,
        coordinates, // Directly storing the coordinates object. Consider converting to GeoPoint if needed.
        label
      });
      console.log('Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      throw error; // Propagate the error
    }
  }

  private getPickupLocationsRef(userId: string) {
    return collection(this.firestore, `users/${userId}/addresses`);
  }

  addPickupLocationToUser(userId: string, pickupLocation: PickupLocation): Promise<void> {
    const pickupLocationsRef = this.getPickupLocationsRef(userId);
    const locationRef = doc(pickupLocationsRef);
    return setDoc(locationRef, pickupLocation);
  }

  getPickupLocationsForUser(userId: string): Observable<PickupLocation[]> {
    const pickupLocationsRef = this.getPickupLocationsRef(userId);
    return new Observable(subscriber => {
      onSnapshot(pickupLocationsRef, (querySnapshot) => {
        const pickupLocations: PickupLocation[] = [];
        querySnapshot.forEach((doc) => {
          pickupLocations.push({ id: doc.id, ...doc.data() as PickupLocation });
        });
        subscriber.next(pickupLocations);
      }, (error) => subscriber.error(error));
    });
  }

  updatePickupLocation(userId: string, locationId: string, updatedLocation: PickupLocation): Promise<void> {
    const locationRef = doc(this.firestore, `users/${userId}/addresses`, locationId);

    // Prepare the object for updating. Only include the fields that can be updated.
    const locationUpdate = {
      name: updatedLocation.label,
      geopoint: updatedLocation.coordinates,
      isDefault: updatedLocation.isDefault
      // Add other fields from PickupLocation as needed
    };

    return updateDoc(locationRef, locationUpdate);
  }

  deletePickupLocation(userId: string, locationId: string): Promise<void> {
    const locationRef = doc(this.firestore, `users/${userId}/addresses`, locationId);
    return deleteDoc(locationRef);
  }

  async addLessonToUser(userId: string, lesson: any): Promise<void> {
    // Reference to the subcollection for user's lessons
    const userLessonsRef = collection(this.firestore, `users/${userId}/lessons`);

    try {
      // This will automatically generate a unique ID for each new lesson
      const lessonRef = doc(userLessonsRef);
      await setDoc(lessonRef, lesson);
    } catch (error) {
      console.error("Error adding lesson to user:", error);
      throw error; // Propagate the error
    }
  }

  getLessonsForUser(userId: string): Observable<any[]> {
    const lessonsRef = collection(this.firestore, `users/${userId}/lessons`);

    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(lessonsRef, (querySnapshot) => {
        const lessons: any[] | undefined = [];
        querySnapshot.forEach((doc) => {
          lessons.push({ id: doc.id, ...doc.data() });
        });
        subscriber.next(lessons);
      }, (error) => {
        subscriber.error(error);
      });

      return { unsubscribe };
    });
  }


  getLessonById(userId: string, lessonId: string): Observable<any> {
    const lessonRef = doc(this.firestore, `users/${userId}/lessons/${lessonId}`);

    return new Observable(subscriber => {
      onSnapshot(lessonRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          subscriber.next(docSnapshot.data());
        } else {
          subscriber.next(null); // No lesson found
        }
      }, (error) => {
        subscriber.error(error); // Handle any errors
      });
    });
  }


  getInstructorDetails(instructorId: string): Observable<any> {
    const instructorRef = doc(this.firestore, `users/${instructorId}`);

    // Return an observable of the instructor details
    return new Observable(subscriber => {
      getDoc(instructorRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
          const instructorData = docSnapshot.data();
          // Construct an object with only the necessary fields
          const instructorDetails = {
            name: instructorData['name'], // assuming 'name' is the field for the instructor's name
            imageUrl: instructorData['imageUrl'] // assuming 'imageUrl' is the field for the instructor's image
            // add other fields as needed
          };
          subscriber.next(instructorDetails);
        } else {
          subscriber.next(null); // No instructor found
        }
      }).catch(error => {
        subscriber.error(error); // Handle any errors
      });
    });
  }


}
