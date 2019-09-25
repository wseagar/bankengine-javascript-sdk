
const { AuthClient, ApiClient } = require("bankengine-js-sdk");
const express = require("express");
const app = express();

// server static files from wwwroot
app.use(express.static('wwwroot'))
// set the view engine to ejs
app.set('view engine', 'ejs');


const clientId = "";
const clientSecret = "";
const redirectUri = "http://localhost:5000/callback";

const authClient = new AuthClient(clientId, clientSecret, redirectUri);
const apiClient = new ApiClient();


const scopes = ["userinfo", "accounts", "balance", "transactions", "payments"];

app.get("/", (req, res) => {
    // Generate auth url, nonce is not used since we use authorization_code grant
    
    // In a real application should store the state value back on the client (ie in a cookie)
    // Or in a server side cache/session storage
    const authURL = authClient.generateAuthorizationURL(scopes, "nonce", "state");
    res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    // should validate state
    // const state = req.query.state;

    // exchange code for access token and optionaly redirect token
    const tokens = await authClient.exchangeToken(code);
    const accessToken = tokens.access_token;
    
    // return the access token to the client
    res.redirect(`/app?accessToken=${accessToken}`);
});

app.get('/app', async (req, res) => {
    const accessToken = req.query.accessToken;

    // get the users bank accounts
    const accounts = await apiClient.getAccounts(accessToken);


    const toDate = new Date(Date.now());
    const fromDate = new Date(Date.now());
    fromDate.setMonth(fromDate.getMonth() - 3);

    const results = {}
    for (const account of accounts.data) {
        // query 3 months of transactions from the users account
        const transactions = await apiClient.getTransactions(accessToken, account.accountId, fromDate, toDate);

        for (let transaction of transactions.data) {
            for (let category of transaction.categories) {
                // store a count of the number of transactions in each category
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
    }
    
    for (const viewModel of Object.values(results)) {
        // round because of javascripts floating point precision
        viewModel.amount = viewModel.amount.toFixed(2);
        const merchantCount = {}

        // count the the merchants in each category
        for (const transation of viewModel.transactions) {
            const merchantName = transation.merchantName;
            if (merchantName in merchantCount) {
                merchantCount[merchantName]++;
            } else {
                merchantCount[merchantName] = 1;
            }
        }

        // find the most frequent merchant in each category
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

app.listen(5000, () => console.log("BankEngine sample app listening on port 5000..."));