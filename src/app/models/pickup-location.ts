export interface PickupLocation {
  id?: string; // Optional id, useful if using document IDs from Firestore
  label: string; // Name given to the pickup location
  coordinates: { // Changed from geopoint to coordinates
    lat: number;
    lng: number;
  };
  address: string; // The address of the pickup location
  isDefault: boolean; // Whether this location is the default pickup location
}
