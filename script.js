const BASE_URL = "https://my-bank-api-v2.up.railway.app";

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
    
    // Auto-refresh data when switching views
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
        // Matches holderName variable in your Java model
        alert("Success! Account Created for: " + (result.holderName || "User"));
        listAccount();
    })
    .catch(err => alert("Error creating account. Check server status."));
}

// --- DEPOSIT (The specific debug fix for your 404) ---
function depositMoney() {
    const accNum = document.getElementById("d-acc-num").value;
    const amount = document.getElementById("d-amount").value;

    // FIX: Change /transactions/deposite to /accounts/deposit
    const url = `${BASE_URL}/accounts/deposit?accountNumber=${accNum}&amount=${amount}`;
    
    fetch(url, { method: "POST" })
    .then(res => {
        if (!res.ok) throw new Error("Account not found. Ensure you created it first.");
        return res.json();
    })
    .then(result => {
        alert("Deposit Successful! New Balance: $" + result.balance);
        listAccount(); 
    })
    .catch(err => alert("Error: " + err.message));
}
// --- WITHDRAW ---
function withdrawMoney() {
    const accNum = document.getElementById("w-acc-num").value;
    const amount = document.getElementById("w-amount").value;

    fetch(`${BASE_URL}/accounts/withdraw?accountNumber=${accNum}&amount=${amount}`, { 
        method: "POST" 
    })
    .then(res => {
        if (!res.ok) throw new Error("Check balance or account number");
        return res.json();
    })
    .then(result => {
        alert("Withdraw Successful! New Balance: $" + result.balance);
        listAccount();
    })
    .catch(err => alert("Withdraw failed: " + err.message));
}

// --- TRANSFER ---
function transferMoney() {
    const fromAcc = document.getElementById("t-from-acc").value;
    const toAcc = document.getElementById("t-to-acc").value;
    const amount = document.getElementById("t-amount").value;

    fetch(`${BASE_URL}/accounts/transfer?fromAccNum=${fromAcc}&toAccNum=${toAcc}&amount=${amount}`, { 
        method: "POST" 
    })
    .then(res => {
        if (!res.ok) throw new Error("One or both accounts not found");
        alert("Transfer Successful!");
        listAccount();
    })
    .catch(err => alert("Transfer failed: " + err.message));
}
function viewSingleAccount() {
    const accNum = document.getElementById("v-acc-num").value;
    const table = document.getElementById("result-table");
    const tbody = document.getElementById("single-account-data");

    if (!accNum) return alert("Please enter an account number");

    fetch(`${BASE_URL}/accounts/${accNum}`)
    .then(res => {
        if (!res.ok) {
            table.style.display = "none"; // Hide table if not found
            throw new Error("Account not found.");
        }
        return res.json();
    })
    .then(acc => {
        // Show the table and fill it with data
        table.style.display = "table"; 
        tbody.innerHTML = `
            <tr>
                <td>${acc.accountNumber}</td>
                <td>${acc.holderName}</td>
                <td>${acc.email}</td>
                <td>$${acc.balance}</td>
            </tr>
        `;
    })
    .catch(err => alert(err.message));
}
// --- VIEW ALL ACCOUNTS ---
// --- LIST ALL ACCOUNTS ---
function listAccount() {
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        let html = "";
        data.forEach(acc => {
            // CHANGE acc.name TO acc.holderName
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
function refreshStaffView() {
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        document.getElementById("staff-count").innerText = data.length;
    });
}
