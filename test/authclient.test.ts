import { AuthClient } from '../src/AuthClient';

describe('authclient', () => {
  it('generates correct url', () => {
    let authClient = new AuthClient("authorizationCodeClient", "mysecret", "http://localhost:5436/account/oAuth2");
    let scope: string[] = ['userinfo', 'accounts', 'balance', 'transactions'];
    let nonce: string =  'hello';
    let state: string = 'world';

    const expected: string = "https://auth.bankengine.nz/connect/authorize/callback?response_type=code&client_id=authorizationCodeClient&redirect_uri=http://localhost:5436/account/oAuth2&scope=userinfo%20accounts%20balance%20transactions&nonce=hello&state=world";

    expect(authClient.generateAuthorizationURL(scope, nonce, state)).toBe(expected)
  });
});
