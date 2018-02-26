// Your JavaScript goes here.

// Declare config constants
const CONFIG_API_ENDPOINT = "https://api.fixer.io";
const supportedCurrencies = {
    "USD": { "currency": "USD", "symbol": "$", "flagcode": "us" },
    "EUR": { "currency": "EUR", "symbol": "€", "flagcode": "eu" },
    "JPY": { "currency": "JPY", "symbol": "¥", "flagcode": "jp" }
};
const DEFAULT_SOURCE_CURRENCY = "USD";
const DEFAULT_TARGET_CURRENCY = "EUR";
const DEFAULT_SOURCE_CURRENCY_AMOUNT = 1;

// Declare all the requires DOM elements
let sourceCurrency = document.getElementById('source-currency');
let targetCurrency = document.getElementById('target-currency');
let sourceCurSymbol = document.getElementById('source-cur-symbol');
let targetCurSymbol = document.getElementById('target-cur-symbol');
let sourceCurAmount = document.getElementById('source-cur-amount');
let targetCurAmount = document.getElementById('target-cur-amount');
let loader = document.getElementById('loader');
let switchCurrency = document.getElementById('img-switch');
let menuSourceCurrency = document.getElementById('source-currency-menu');
let menuTargetCurrency = document.getElementById('target-currency-menu');

/**
 * EVENTS LISTENER
 */
// Inititalize on document loaded
document.addEventListener('DOMContentLoaded', init);

// When user changed the value on the source currency amount -> Convert the currency 
var timeout = null;
sourceCurAmount.onkeyup = () => {
    // Validate if input value is empty
    if (sourceCurAmount.value.length < 1) return;

    // If cache is exist, use the cache exchange rate first only then only server call
    let base = sourceCurrency.innerHTML;
    if (supportedCurrencies[base].rates) {
        displayConvertResult(supportedCurrencies[base].rates); // Update result to DOM
    }

    // Wait for user to stop typing, this is to avoid multiple server call.
    clearTimeout(timeout); // clear previouis timeout
    timeout = setTimeout(() => {
        convertCurrency();
    }, 100);
};

// When user clicked on the switch currency image -> Switch the Source currency and Target currency
switchCurrency.onclick = () => {
    selectCurrency(targetCurrency.innerHTML, sourceCurrency.innerHTML);
    convertCurrency();
};

// When user clicked on target currency -> Toogle Source Currency Menu
sourceCurrency.onclick = () => {
    if (menuSourceCurrency.style.display === "none") {
        menuSourceCurrency.style.display = "block";
    } else {
        menuSourceCurrency.style.display = "none";
    }
}

// When user clicked on target currency -> Toogle Target Currency Menu
targetCurrency.onclick = () => {
    if (menuTargetCurrency.style.display === "none") {
        menuTargetCurrency.style.display = "block";
    } else {
        menuTargetCurrency.style.display = "none";
    }
}

/**
 * FUNCTIONS
 */
function init() {
    // Initialize default config settings
    sourceCurAmount.value = DEFAULT_SOURCE_CURRENCY_AMOUNT; // Load default amount
    selectCurrency(DEFAULT_SOURCE_CURRENCY, DEFAULT_TARGET_CURRENCY); // Load default currency
    convertCurrency(); // Trigger Convert currency

    // Load all supported currencies into drop-down-menu
    menuSourceCurrency.children[0].innerHTML = loadSupportedCurrencies('Source');
    menuTargetCurrency.children[0].innerHTML = loadSupportedCurrencies('Target');
}

/**
 * Select the SOURCE and TARGET currency and update the DOM; 
 * @param {string} sourceCurreny - Source Currency.
 * @param {string} targetCurrency - Target Currency.
 */
function selectCurrency(_sourceCurrecy, _targetCurrency) {
    sourceCurrency.innerHTML = _sourceCurrecy;
    sourceCurSymbol.innerHTML = supportedCurrencies[_sourceCurrecy].symbol;
    targetCurrency.innerHTML = _targetCurrency;
    targetCurSymbol.innerHTML = supportedCurrencies[_targetCurrency].symbol;
}

/** 
 *  Retrieve all the supported currencies into HTML string and render it to the DOM
 *  @params {string} option = 'Source' or 'Target'
 *  return {string} currenciesList = return a string of HTML to update the DOM
 */
function loadSupportedCurrencies(option) {
    let currenciesList = '';
    for (key in supportedCurrencies) {
        currenciesList = currenciesList + `
        <li onclick="select${option}Currency('${supportedCurrencies[key].currency}')">
            <span class="flag flag-${supportedCurrencies[key].flagcode}"></span>
            <a class="dropdown-item">${supportedCurrencies[key].currency} ${supportedCurrencies[key].symbol}</a>
        </li>`
    }
    return currenciesList;
}

function selectSourceCurrency(currency) {
    // Validate if the source currency and target currency are the same, if yes swarp it.
    if (currency == targetCurrency.innerHTML)
        selectCurrency(currency, sourceCurrency.innerHTML);
    else {
        selectCurrency(currency, targetCurrency.innerHTML);
    }
    menuSourceCurrency.style.display = "none";
    return convertCurrency();
}

function selectTargetCurrency(currency) {
    // Validate if the target currency and source currency are the same, if yes swarp it.
    if (currency == sourceCurrency.innerHTML)
        selectCurrency(targetCurrency.innerHTML, currency);
    else {
        selectCurrency(sourceCurrency.innerHTML, currency);
    }
    menuTargetCurrency.style.display = "none";
    return convertCurrency();
}

/** GET latest foreign exchange rate from the API Endpoint
 *  @params {string} base = Source Currency.
 *  @params {string} symbols = Supported Currencies.
 */
function convertCurrency() {
    loader.style.display = "block"; // Show Loader
    let base = sourceCurrency.innerHTML;
    let symbols = targetCurrency.innerHTML;

    axios.get(`${CONFIG_API_ENDPOINT}/latest`, {
        params: {
            base: base,
            symbols: symbols
            // REMOVED: To Cache all foreign exchange rate
            // symbols: Object.keys(supportedCurrencies).join(',') 
        }
    })
        .then(function (response) {
            loader.style.display = "none"; // Hide Loader
            // console.log(response);
            exchangeRate = response.data.rates;
            supportedCurrencies[base].rates = exchangeRate; // Cache the exchange rates to supportedCurrencies Object
            displayConvertResult(exchangeRate); // Update results to DOM
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Update the currency converted results to DOM
function displayConvertResult(exchangeRate) {
    result = sourceCurAmount.value * exchangeRate[targetCurrency.innerHTML];
    targetCurAmount.value = result.toFixed(2);
}