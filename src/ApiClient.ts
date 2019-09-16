import decode from "jwt-decode";
import moment from "moment";
import axios, { AxiosRequestConfig } from "axios";
import { Data } from 'models/Data';
import { Account } from 'models/Account';
import { Transaction } from 'models/Transaction';
import { JWT } from 'models/JWT';
import { UserInfo } from 'models/UserInfo';

export default class ApiClient {
    
    private readonly _apiUrl: string = "https://api.bankengine.nz"

    constructor(apiUrl?: string) {
        if (apiUrl) {
            this._apiUrl = apiUrl;
        }
    }

    public async execute<T>(accessToken: string, path: string, ) : Promise<Data<T>> {
        const validToken = this.isTokenValid(accessToken);
        if (!validToken) {
            throw new Error("Expired access token");
        }

        const request: AxiosRequestConfig = {
            baseURL: this._apiUrl,
            url: path,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
        };

        const resp = await axios(request);
        const result : Data<T> = resp.data;
        return result;
    }

    public async getAccounts(accessToken: string) : Promise<Data<Account>> {
        return await this.execute<Account>(accessToken, '/data/v1/accounts');
    }

    public async getAccount(accessToken: string, accountId: string) : Promise<Data<Account>> {
        return await this.execute<Account>(accessToken, `/data/v1/accounts/${accountId}`);
    }

    public async getBalance(accessToken: string, accountId: string) : Promise<Data<Account>> {
        return await this.execute<Account>(accessToken, `/data/v1/accounts/${accountId}/balance`);
    }

    public async getTransactions(accessToken: string, accountId: string, from?: string, to?: string) : Promise<Data<Transaction>> {
        let qs: string | undefined;
        if (from && to) {
            qs = `?from=${this.parseDateToISO(from)}&to=${this.parseDateToISO(to)}`;
        }

        let uri = `/data/v1/accounts/${accountId}/transactions`;
        if (qs){
            uri += qs;
        }

        return await this.execute<Transaction>(accessToken, uri);
    }

    public async postPayment(accessToken: string, fromAccount: string, toAccount: string, description: string, amount: number) {
        const options = {
            fromAccount: fromAccount,
            toAccount : toAccount,
            description : description,
            amount : amount
        };

        const request: AxiosRequestConfig = {
            baseURL: this._apiUrl,
            url: "payments/v0/createPayment",
            method: "POST",
            headers: {
              "Authorization": "Bearer " + accessToken
            },
            data: options
        };

        try {
            await axios(request);
        }
        catch (e) {
            throw new Error("Payment invalid");
        }
    }

    public async getUserInfo(accessToken: string) : Promise<Data<UserInfo>> {
        return await this.execute<UserInfo>(accessToken, `/data/v1/userinfo`);
    }

    public parseDateToISO(input: string) : string {
        try {
            var date = new Date(input);
            var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
            return dateString;
        } catch (e){
            throw new Error(`${input} is not a valid javascript date string`);
        }
    }

    public isTokenValid(accessToken: string) : boolean {
        let decoded: JWT;
        try {
            decoded = decode<JWT>(accessToken);
        } catch (error) {
            return false;
        }
        const expiry = decoded.exp;
        const now = moment().utc().unix();
        return now - expiry < 0;
    }
}