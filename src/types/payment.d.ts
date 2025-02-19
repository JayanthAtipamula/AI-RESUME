interface CashfreeResponse {
  success: boolean;
  order: {
    order_token: string;
    order_id: string;
  };
}

interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  returnUrl: string;
  mode: 'sandbox' | 'production';
  onSuccess?: (data: CashfreePaymentResult) => void;
  onFailure?: (data: CashfreePaymentResult) => void;
  onClose?: () => void;
}

interface CashfreePaymentResult {
  order_id: string;
  transaction_id?: string;
  transaction_status: string;
  payment_method?: string;
}

interface CashfreeStatic {
  checkout(options: CashfreeCheckoutOptions): Promise<{
    error?: { message: string };
    redirect?: boolean;
  }>;
}

declare const Cashfree: CashfreeStatic;

interface Window {
  Cashfree: typeof Cashfree;
} 