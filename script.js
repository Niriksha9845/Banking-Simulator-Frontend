const BASE_URL = "https://my-bank-api-v2.up.railway.app";

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
    
    // Automatically refresh stats if staff section is opened
    if(sectionId === 'staff') {
        refreshStaffView();
    }
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
        // MATCHING: Account.java variable 'holderName'
        alert("Success! Account Created for: " + (result.holderName || "User"));
        listAccount();
    }).catch(err => alert("Error creating account. Check server status."));
}

// --- DEPOSIT ---
function depositMoney() {
    const accNum = document.getElementById("d-acc-num").value;
    const amount = document.getElementById("d-amount").value;
    fetch(BASE_URL + `/accounts/deposit?accountNumber=${accNum}&amount=${amount}`, { method: "POST" })
    .then(res => res.json())
    .then(result => {
        alert("Deposit Successful! New Balance: $" + result.balance);
        listAccount();
    }).catch(err => alert("Deposit failed. Check account number exists."));
}

// --- WITHDRAW ---
function withdrawMoney() {
    const accNum = document.getElementById("w-acc-num").value;
    const amount = document.getElementById("w-amount").value;
    fetch(BASE_URL + `/accounts/withdraw?accountNumber=${accNum}&amount=${amount}`, { method: "POST" })
    .then(res => res.json())
    .then(result => {
        alert("Withdraw Successful! New Balance: $" + result.balance);
        listAccount();
    }).catch(err => alert("Withdraw failed. Check balance."));
}

// --- TRANSFER ---
function transferMoney() {
    const fromAcc = document.getElementById("t-from-acc").value;
    const toAcc = document.getElementById("t-to-acc").value;
    const amount = document.getElementById("t-amount").value;
    fetch(BASE_URL + `/accounts/transfer?fromAccNum=${fromAcc}&toAccNum=${toAcc}&amount=${amount}`, { method: "POST" })
    .then(() => {
        alert("Transfer Successful!");
        listAccount();
    }).catch(err => alert("Transfer failed."));
}

// --- VIEW SINGLE ACCOUNT ---
function viewSingleAccount() {
    const accNum = document.getElementById("v-acc-num").value;
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        // Matches the 'accountNumber' key in your JSON
        const acc = data.find(a => a.accountNumber === accNum);
        const resultDiv = document.getElementById("view-result");
        if (acc) {
            // FIX: Replaced 'name' with 'holderName'
            resultDiv.innerHTML = `<div class="account-row" style="margin-top:10px;">
                <strong>Holder:</strong> ${acc.holderName} | <strong>Balance:</strong> $${acc.balance}
            </div>`;
        } else {
            resultDiv.innerHTML = "<p style='color:red;'>Account not found.</p>";
        }
    });
}

// --- LIST ALL ACCOUNTS ---
function listAccount() {
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        let html = "";
        data.forEach(acc => {
            // All keys match the API's JSON output and Account.java exactly
            html += `<tr>
                <td>${acc.accountNumber}</td>
                <td>${acc.holderName}</td>
                <td>${acc.email}</td>
                <td>$${acc.balance}</td>
            </tr>`;
        });
        document.getElementById("accounts-data").innerHTML = html;
    });
}

// --- STAFF VIEW ---
function refreshStaffView() {
    fetch(BASE_URL + "/accounts/all")
    .then(res => res.json())
    .then(data => {
        document.getElementById("staff-count").innerText = data.length;
    })
    .catch(err => console.error("Account fetch failed"));

    fetch(BASE_URL + "/staff/all")
    .then(res => res.json())
    .then(staffData => {
        const listElement = document.getElementById("staff-names-list");
        listElement.innerHTML = ""; 

        if (!staffData || staffData.length === 0) {
            listElement.innerHTML = "<li>No staff members found.</li>";
        } else {
            staffData.forEach(member => {
                const li = document.createElement("li");
                li.style.padding = "5px 0";
                li.innerHTML = `👤 <strong>${member.name}</strong> - <span style="color: #666;">${member.role}</span>`;
                listElement.appendChild(li);
            });
        }
    })
    .catch(err => {
        console.error("Staff fetch failed", err);
    });
}
