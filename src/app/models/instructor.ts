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
    weekly: {
      [day: string]: { start: string, end: string }[],
    },
    specificDates: {
      [date: string]: { start: string, end: string }[],
    },
  };
  distance: number; // Add the distance property
}

export interface Review {
  rating: number;
  comment: string;
}
