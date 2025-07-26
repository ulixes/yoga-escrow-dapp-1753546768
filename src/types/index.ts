export interface YogaClass {
  id: string;
  name: string;
  instructor: string;
  duration: number;
  price: bigint;
  date: Date;
  maxParticipants: number;
  currentParticipants: number;
}

export interface Booking {
  id: string;
  classId: string;
  transactionId: bigint;
  buyer: string;
  seller: string;
  amount: bigint;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  deadline: Date;
}

export const TransactionStatus = {
  NoDispute: 0,
  WaitingForBuyerFees: 1,
  WaitingForSellerFees: 2,
  DisputeCreated: 3,
  Resolved: 4
} as const;