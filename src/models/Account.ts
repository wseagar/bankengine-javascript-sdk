export interface Account {
    accountId: string;
    accountType: string;
    accountNumber: string;
    currency: string;
    displayName: string;
    updateTimestamp: Date;
    provider: Provider;
    links: AccountLinks;
}

interface AccountLinks {
    self: string;
    balances: string;
    transactions: string;
}

interface Provider {
    providerId: string;
    displayName: string;
}