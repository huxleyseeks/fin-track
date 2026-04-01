// Selct and modify date
const date = document.getElementById('date');
date.textContent = new Date().toDateString();

// Get balance and expense display boards
const totalBalance = document.getElementById('total-balance');
const incomeAmount = document.querySelector(".income-amount");
const spentAmount = document.querySelector(".spent-amount");

const totalIncome = document.getElementById("total-income");
const totalExpenses = document.getElementById("total-expenses");
const tIncomeTrack = document.getElementById("t-income-track");
const tExpenseTrack = document.getElementById("t-expense-track");

// Get buttons
const tabBtns = document.querySelectorAll(".tab-btn");
const filterBtns = document.querySelectorAll(".filter-btn");

// Get tabs
const transactionTab = document.getElementById("transactions-section");
const formTab = document.getElementById("form");
const analyticsTab = document.getElementById("analytics")

const tabs = [transactionTab, formTab, analyticsTab];



tabBtns.forEach((tabBtn, i) => {
    tabBtn.addEventListener("click", () => {
        tabBtns.forEach(other => {
            if (other.classList.contains("active")) {
                other.classList.remove("active");
            }
        })
        tabs.forEach(tab => {
            tab.style.display = "none";
        })
        tabBtn.classList.add("active");
        switchTabs(i);
    })
})

function switchTabs(i) {
    tabs[i].style.display = "block";
}