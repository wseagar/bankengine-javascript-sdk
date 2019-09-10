export interface Balance {
    currency: string;
    available: number;
    current: number;
    overdraft: number;
    updatedTimestamp: Date;
    links: BalanceLinks;
}

export interface BalanceLinks {
    self: string;
    account: string;
}