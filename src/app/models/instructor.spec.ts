import { Instructor, Review } from './instructor';

describe('Instructor', () => {
  it('should create an instance', () => {
    const instructor: Instructor = {
      id: 1,
      name: 'John Doe',
      imageUrl: 'https://example.com/johndoe.jpg',
      rating: 4.5,
      price: 50,
      gender: 'Male',
      experience: 5,
      reviews: [
        { rating: 4, comment: 'Great instructor' },
        { rating: 5, comment: 'Had an amazing experience!' },
      ],
    };
    expect(instructor).toBeTruthy();
  });
});

describe('Review', () => {
  it('should create an instance', () => {
    const review: Review = {
      rating: 4,
      comment: 'Great instructor',
    };
    expect(review).toBeTruthy();
  });
});
