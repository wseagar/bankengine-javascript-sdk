export interface Transaction {
    transactionId: string;
    timestamp: Date;
    description: string;
    amount: number;
    currency: string;
    creditDebitIndicator: string;
    type: string;
    categories: string[];
    mechantName?: string;
}