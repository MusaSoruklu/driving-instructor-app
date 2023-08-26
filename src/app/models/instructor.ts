export interface Instructor {
  _id: string;
  name: string;
  imageUrl: string;
  rating: number;
  price: number;
  gender: string;
  experience: number;
  reviews: Review[];
  location: { type: string, coordinates: number[] };
  bookings: { studentId: string, date: Date, time: string }[];
  availability: {
    [dayOrDate: string]: Slot[],
  };
  distance: number;
  transmission: string [];
  lessonDuration: number [];
}

export interface Review {
  rating: number;
  comment: string;
}

export interface Slot {
  start: string;
  end: string;
  type: 'available' | 'unavailable';
}