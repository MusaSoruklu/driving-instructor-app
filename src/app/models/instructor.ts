export interface Instructor {
    id: number;
    name: string;
    imageUrl: string;
    rating: number;
    price: number;
    gender: string;
    experience: number;
    reviews: Review[];
  }
  
  export interface Review {
    rating: number;
    comment: string;
  }
  