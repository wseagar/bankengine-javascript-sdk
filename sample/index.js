
const { AuthClient, ApiClient } = require("bankengine-js-sdk");
const express = require("express");
const app = express();

// server static files from wwwroot
app.use(express.static('wwwroot'))
// set the view engine to ejs
app.set('view engine', 'ejs');


const clientId = "";
const clientSecret = "";
const redirectUri = "http://localhost:5436/account/oAuth2";
const authUrl = "https://authdemo.bankengine.nz";
const apiUrl = "https://apidemo.bankengine.nz";

const authClient = new AuthClient(clientId, clientSecret, redirectUri, authUrl);
const apiClient = new ApiClient(apiUrl);


const scopes = ["userinfo", "accounts", "balance", "transactions"];

app.get("/", (req, res) => {
    const authURL = authClient.generateAuthorizationURL(scopes, "nonce", "state");
    res.redirect(authURL);
});

app.get('/account/oAuth2', async (req, res) => {
    const code = req.query.code;
    const tokens = await authClient.exchangeToken(code);
    const accessToken = tokens.access_token;
    res.redirect(`/app?accessToken=${accessToken}`);
});

app.get('/app', async (req, res) => {
    const accessToken = req.query.accessToken;
    const accounts = await apiClient.getAccounts(accessToken);
    const transactions = await apiClient.getTransactions(accessToken, accounts.data[0].accountId);
    const results = {}

    for (let transaction of transactions.data) {
        for (let category of transaction.categories) {
            if (category in results) {
                let res = results[category];
                res.count++;
                res.amount += transaction.amount;
                res.transactions.push(transaction)
            } else {
                results[category] = {
                    'amount' : transaction.amount,
                    'count' : 1,
                    'transactions' : [transaction]
                }
            }
        }
    }

    for (const viewModel of Object.values(results)) {
        const merchantCount = {}

        for (const transation of viewModel.transactions) {
            const merchantName = transation.merchantName;
            if (merchantName in merchantCount) {
                merchantCount[merchantName]++;
            } else {
                merchantCount[merchantName] = 1;
            }
        }


        let mostFrequentMerchant = [null, 0];
        for (const [merchantName, count] of Object.entries(merchantCount)) {
            if (mostFrequentMerchant == null) {
                mostFrequentMerchant[0] = merchantName;
                mostFrequentMerchant[1] = count;
            }

            if (count > mostFrequentMerchant[1]) {
                mostFrequentMerchant[0] = merchantName;
                mostFrequentMerchant[1] = count;
            }
        }
        viewModel.merchant = mostFrequentMerchant[0];
    }

    res.render('page', {
        results: results
    });
})

app.listen(5436, () => console.log("Example app listening on port 5436..."));