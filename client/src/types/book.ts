export type BookMetadata = {
  id: number;
  title: string;
  bookCoverImageURL: string;
  author: string;
  description: string;
  size: number;
  isPurchased: boolean;
  price: number;
};

export type PendingBooks = {
  requestId: number;
  title: string;
  author: string;
  description: string;
  size: number;
  price: number;
  coverImageURL: string;
  publisherId: number;
  publisherName: string;
  publisherEmail: string;
  status: string;
  rejectReason: string;
};
