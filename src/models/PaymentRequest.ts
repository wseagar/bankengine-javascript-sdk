export interface PaymentRequest {
    fromAccount: string;
    toAccount: string;
    amount: number;
    from: PCR;
    to: PCR;
}

// particulars code reference
export interface PCR {
    particulars: string;
    code: string;
    reference: string;
}