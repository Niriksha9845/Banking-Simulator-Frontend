const BASE_URL = "http://localhost:8080";

// --- NAVIGATION & AUTHENTICATION ---
function showAuth(formId) {
    document.getElementById('hero-section').style.display = 'none';
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(formId).style.display = 'block';
}

function login() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('bankActions').style.display = 'block';
    document.getElementById('logoutBox').style.display = 'block';
    showSection('create'); 
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'list') listAccount();
    if (sectionId === 'staff') refreshStaffView();
}

// --- CREATE ACCOUNT ---
function createAccount() {
    const data = {
        name: document.getElementById("c-name").value,
        email: document.getElementById("c-email").value,
        balance: document.getElementById("c-balance").value
    };
    fetch(BASE_URL + "/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        alert("Success! Account Created. Your Account Number is: " + result.accountNumber);
        listAccount();
    })
    .catch(err => alert("Error creating account. Check server status."));
}

// --- DEPOSIT ---
function depositMoney() {
    const accNo = document.getElementById("d-acc-num").value;
    const amount = document.getElementById("d-amount").value;
    
    // UPDATED: Matches Java TxRequest class
    const data = { accNo, amount: parseFloat(amount) };

    fetch(`${BASE_URL}/transactions/deposite`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.text()) // Java returns a simple String
    .then(result => {
        alert(result);
        listAccount(); 
    })
    .catch(err => alert("Error: " + err.message));
}

// --- WITHDRAW ---
function withdrawMoney() {
    const accNo = document.getElementById("w-acc-num").value;
    const amount = document.getElementById("w-amount").value;

    // This object must match the 'TxRequest' class in your ApiServer.java
    const data = { 
        accNo: accNo, 
        amount: parseFloat(amount) 
    };

    fetch(`${BASE_URL}/transactions/withdraw`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Check balance or account number");
        return res.text(); // Use .text() because Java returns a String message
    })
    .then(result => {
        alert(result); // Should show "Withdraw successfully..!"
        listAccount();
    })
    .catch(err => alert("Withdraw failed: " + err.message));
}

// --- TRANSFER ---
function transferMoney() {
    const fromAcc = document.getElementById("t-from-acc").value;
    const toAcc = document.getElementById("t-to-acc").value;
    const amount = document.getElementById("t-amount").value;

    // UPDATED: Matches Java TransferRequest class
    const data = { fromAcc, toAcc, amount: parseFloat(amount) };

    fetch(`${BASE_URL}/transactions/transfer`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.text()) // Java returns a simple String
    .then(result => {
        alert(result);
        listAccount();
    })
    .catch(err => alert("Error: " + err.message));
}

// --- VIEW SINGLE ACCOUNT ---
function viewSingleAccount() {
    const accNum = document.getElementById("v-acc-num").value;
    const table = document.getElementById("result-table");
    const tbody = document.getElementById("single-account-data");

    if (!accNum) return alert("Please enter an account number");

    fetch(`${BASE_URL}/accounts/${accNum}`)
    .then(res => {
        if (!res.ok) {
            table.style.display = "none";
            throw new Error("Account not found.");
        }
        return res.json();
    })
    .then(acc => {
        table.style.display = "table"; 
        tbody.innerHTML = `
            <tr>
                <td>${acc.accountNumber}</td>
                <td>${acc.holderName}</td>
                <td>${acc.email}</td>
                <td class="balance-cell">$${acc.balance}</td>
            </tr>
        `;
    })
    .catch(err => {
        table.style.display = "none";
        alert(err.message);
    });
}

// --- LIST ALL ACCOUNTS ---
function listAccount() {
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        let html = "";
        data.forEach(acc => {
            html += `<tr>
                        <td>${acc.accountNumber}</td>
                        <td>${acc.holderName}</td>
                        <td>${acc.email}</td>
                        <td>$${acc.balance}</td>
                    </tr>`;
        });
        document.getElementById("accounts-data").innerHTML = html;
    })
    .catch(err => console.error("Could not load account list"));
}

// --- STAFF VIEW ---
