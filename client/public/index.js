var contract = null;
var account = "";
var provider = null;

fetch("./contracts/SigFlow.json").then(response => response.json()).then(json => {
    contract = json;
}).catch(err => {
    setWarning("Contract file not found! " + err.message);
})

function setProvider(_provider) {
    provider = _provider;
}

function clearProvider() {
    provider = null;
}

function setAccount(accounts) {
    const connectButton = document.getElementById("connectButton");
    connectButton.innerText = `${accounts[0].slice(0, 7)}... connected`;
    connectButton.disabled = true;
    account = accounts[0];
}

function clearAccount() {
    const connectButton = document.getElementById("connectButton");
    connectButton.innerText = "Connect Wallet";
    connectButton.disabled = false;
    account = "";
}

function setWarning(text) {
    const warningBox = document.getElementById("warningMessageBox");
    warningBox.style.display = "block";
    warningBox.innerText = text;
}

function clearWarning() {
    const warningBox = document.getElementById("warningMessageBox");
    warningBox.style.display = "none";
    warningBox.innerText = "";
}

function resetForm() {
    const valueField = document.getElementById("valueField");
    valueField.value = "";
    valueField.disabled = true;
    const submitButton = document.getElementById("submitButton");
    submitButton.disabled = true;
}

function setResult(value, setter, validPeriod, signature) {
    const resultField = document.getElementById("signedResult");
    document.getElementById("signedValue").innerText = value;
    document.getElementById("signedSetter").innerText = setter;
    document.getElementById("signedValidPeriod").innerText = validPeriod;
    document.getElementById("signature").innerText = signature;
    resultField.style.display = "block";
}

function clearResult() {
    const resultField = document.getElementById("signedResult");
    resultField.style.display = "none";
}

function reset() {
    clearAccount();
    clearProvider();
    resetForm();
    clearResult();
    clearWarning();
}

function handleAccountsChanged(accounts) {
    if (accounts.length) {
        setAccount(accounts);
    } else {
        reset();
    }
}

async function connectWallet(event) {
    event.preventDefault();
    clearWarning();
    let provider = window.ethereum.providerMap?.get("MetaMask") || window.ethereum;
    if (provider) {
        try {
            setProvider(provider);
            let accounts = await provider.request({ method: "eth_requestAccounts" });
            provider.on("accountsChanged", handleAccountsChanged);
            setAccount(accounts);
            const valueField = document.getElementById("valueField");
            valueField.disabled = false;
            const submitButton = document.getElementById("submitButton");
            submitButton.disabled = false;
        } catch (err) {
            setWarning("Error while connecting! " + err.message);
        }
    } else {
        setWarning("Please install Metamask extension.");
    }
}

async function signMessage(event) {
    event.preventDefault();
    clearWarning();
    const value = document.getElementById("valueField").value;
    const validPeriod = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 1 day from now
    const setter = account;
    let msgParams = JSON.stringify({
        domain: {
            name: "SigFlowContract",
            version: "1.0",
            chainId: 1337, // Truffle network's chain id
            verifyingContract: contract.networks[5777].address, // Address of contract deployed on Truffle network
        },
        message: { value, validPeriod, setter },
        primaryType: "Order",
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            Order: [
                { name: "value", type: "uint256" },
                { name: "setter", type: "address" },
                { name: "validPeriod", type: "uint256" },
            ]
        }
    });
    try {
        const signature = await provider.request({
            method: "eth_signTypedData_v4",
            params: [account, msgParams],
            from: account
        });
        setResult(value, setter, validPeriod, signature);
    } catch (err) {
        setWarning("Some error occurred! " + err.message);
    }
}
