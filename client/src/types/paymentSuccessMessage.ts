export type PaymentSuccessMessage = {
  orderId: string;
  creditProductId: number;
  creditProductName: string;
  paymentMethod: string;
  paymentAmount: number;
  approvedAt: string;
};

export const paymentSuccessToken = "CREDIT_PURCHASE_SUCCESS";
