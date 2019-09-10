export interface JWT {
    amr: [ string ];
    aud: [ string, string ];
    auth_time: number;
    client_id: string;
    connector_id: string;
    exp: number;
    idp: string;
    iss: string;
    nbf: number;
    scope: string[];
    sub: string;
}