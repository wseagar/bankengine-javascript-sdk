export interface UserInfo {
    addresses: Address[];
    dateOfBirth: Date;
    emails: string[];
    fullName: string;
    phones: string[];
    updatedTimestamp: Date;
}

interface Address {
    address: string;
    city: string;
    country: string;
    postCode: string;
}