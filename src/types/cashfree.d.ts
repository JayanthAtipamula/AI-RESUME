interface CashfreeConfig {
  mode: "sandbox" | "production";
}

interface CashfreePaymentConfig {
  orderToken: string;
  onSuccess?: (data: any) => void;
  onFailure?: (data: any) => void;
  onClose?: () => void;
}

declare class Cashfree {
  constructor(config: CashfreeConfig);
  init(config: CashfreePaymentConfig): Promise<void>;
  redirect(): void;
}

interface Window {
  Cashfree: {
    new(config: CashfreeConfig): Cashfree;
  };
} 