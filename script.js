// Selct and modify date
const date = document.getElementById('date');
date.textContent = new Date().toDateString();

// Get balance and expense display boards
const totalBalance = document.getElementById('total-balance');
const incomeAmount = document.querySelector(".income-amount");
const spentAmount = document.querySelector(".spent-amount");

// Progress track
const progFill = document.getElementById("prog-fill");
const pct = document.getElementById("pct");

const totalIncome = document.getElementById("total-income");
const totalExpenses = document.getElementById("total-expenses");
const tIncomeTrack = document.getElementById("t-income-track");
const tExpenseTrack = document.getElementById("t-expense-track");
const chartWrap = document.getElementById("chart-wrap");
const doughnutCanvas = document.getElementById("myDoughnutChart");
const chartEmptyState = document.getElementById("chart-empty-state");
let doughnutChart = null;

// Get buttons
const tabBtns = document.querySelectorAll(".tab-btn");
const filterTypeBtns = document.querySelectorAll(".filter-type-btn");
const addTransactionBtn = document.getElementById("add-transc-btn");
const transactionTypeBtns = document.querySelectorAll(".trans-type-btn");

// Get tabs
const transactionTab = document.getElementById("transactions-section");
const formTab = document.getElementById("form");
const analyticsTab = document.getElementById("analytics");
const tabs = [transactionTab, formTab, analyticsTab];

// Get sub-tabs (list)
const allTransactionList = document.getElementById("all-transaction-list");
const incomeList = document.getElementById("income-list");
const expenseList = document.getElementById("expense-list");
const salaryList = document.getElementById("salary-list");
const giftList = document.getElementById("gift-list");
const lists = [allTransactionList, incomeList, expenseList, salaryList, giftList];

const emptyStateAll = document.querySelector(".empty-state-all");
const emptyStateIncome = document.querySelector(".empty-state-income");
const emptyStateExpense = document.querySelector(".empty-state-expense");
const emptyStateSalary = document.querySelector(".empty-state-salary");
const emptyStateGift = document.querySelector(".empty-state-gift");
const emptyStates = [emptyStateAll, emptyStateIncome, emptyStateExpense, emptyStateSalary, emptyStateGift];
const filterTypes = ["all", "income", "expense", "salary", "gift"];

// Get items from localStorage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Getting the input fiels from the form
const amountInput = document.getElementById("f-amount");
const incomeCategory = document.getElementById("inc-category");
const expenseCategory = document.getElementById("exp-category");
const noteInput = document.getElementById("f-note");
const dateInput = document.getElementById("f-date");
const errMsg = document.getElementById("form-err-message");

let value = null;
let text = null;

let incAmt = 0;
let speAmt = 0;

let activeFilter = "all";
let activeFilterIndex = 0;



// addTransaction()      → validate and add to array
function addTransaction() {
    const amount = parseFloat(amountInput.value);
    const category = value;
    const rawNote = noteInput.value.trim();
    let note = "";
    if (rawNote) {
        note = rawNote[0].toUpperCase() + rawNote.slice(1);
    } else {
        note = category;
    }
    const date = dateInput.value;
    if (!document.querySelector(".trans-type-btn.selected")) {
      errMsg.textContent = "Please select a transaction type.";
      return;
    } else if (!amount || amount <= 0) {
      errMsg.textContent = "Please enter a valid amount.";
      return;
    } else if (text === "Category" || !value) {
      errMsg.textContent = "Please select a category.";
      return;
    } else if (!date) {
      errMsg.textContent = "Please select a date.";
      return;
    }

    errMsg.textContent = "";
    const list = {
      id: Date.now(),
      type: document.querySelector(".trans-type-btn.selected").value,
      amount: amount,
      category: value,
      note: note ? note : value,
      date: date,
    };
    transactions.unshift(list);
    saveData();
    loadData();

    // Empty the form
    amountInput.value = "";
    noteInput.value = "";
    dateInput.value = "";
    transactionTypeBtns.forEach(btn => {
        if (btn.classList.contains("selected")) {
          btn.classList.remove("selected");
        }
        if (btn.classList.contains("income-active")) {
          btn.classList.remove("income-active");
        } else if (btn.classList.contains("expense-active")) {
          btn.classList.remove("expense-active");
        }
    });

    value = null;
    text = null;
}

// renderTransactions()  → build the list from array
function renderTransactions(speificTransactions, tab) {
    tab.innerHTML = "";

    speificTransactions.forEach((transaction) => {
      const { id, type, amount, category, note, date } = transaction;

      const catCaps = `${category[0].toUpperCase()}${category.slice(1)}`;
      const noteCaps = `${note[0].toUpperCase()}${note.slice(1)}`;
      // const asCurrency = `₦${amount.toLocaleString("en-NG")}`;
      const asCurrency = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);

      const li = document.createElement("li");
      li.className = "transaction-item";
      li.innerHTML = `
            <div class="${type === "income" ? "txi-ico" : "txe-ico"}">
                ${type === "income" ? "↑" : "↓"}
            </div>
            <div class="transaction-details">
            <h5 class="transaction-note">${noteCaps}</h5>
            <span class="trans-t-d">${catCaps} • ${new Date(date).toDateString()}</span>
            </div>
            <div class="transaction-amount">
            <span class="${type === "income" ? "txi-amt" : "txc-amt"}">${type === "income" ? "+" : "-"}${asCurrency}</span>
            </div>
        `;

      const txDel = document.createElement("button");
      txDel.classList.add("tx-del");
      txDel.textContent = "✕";

      li.append(txDel);
      switchTabs(tabBtns, tabs, 0);
      switchTabs(filterTypeBtns, lists, 0);
      tab.appendChild(li);

      txDel.addEventListener("click", () => {
        deleteTransaction(id);
      });
    });
    renderSummary();
}

// renderSummary()       → calculate balance, income, expenses
function renderSummary() {

    let totBal = 0;
    let incomeAmt = 0;
    let spentAmt = 0;

    let incomeCount = 0;
    let expenseCount = 0;


    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totBal += transaction.amount;
            incomeAmt += transaction.amount;
            incomeCount++;
        } else {
            totBal -= transaction.amount;
            spentAmt += transaction.amount;
            expenseCount++;
        }
    })

    function formatToCurrency(num) {
        const formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
        return formatted;
    }

    totalBalance.textContent = formatToCurrency(totBal);
    incomeAmount.textContent = formatToCurrency(incomeAmt);
    totalIncome.textContent = formatToCurrency(incomeAmt);
    spentAmount.textContent = formatToCurrency(spentAmt);
    totalExpenses.textContent = formatToCurrency(spentAmt);

    incAmt = incomeAmt,
    speAmt = spentAmt;
    
    
    tIncomeTrack.textContent = `${incomeCount} ${incomeCount === 1 ? "transaction" : "transactions"}`;
    tExpenseTrack.textContent = `${expenseCount} ${expenseCount === 1 ? "transaction" : "transactions"}`;
    
    const spendingRate = incomeAmt > 0 ? (spentAmt / incomeAmt) * 100 : 0;

    if (Math.round(spendingRate) > 100) {
        pct.textContent = `${Math.round(100)}%`;
    } else {
        pct.textContent = `${Math.round(spendingRate)}%`;
    }

    if (Math.round(spendingRate === 0)) {
        progFill.style.width = `${0}%`;
    } else {
      progFill.style.width = `${Math.min(spendingRate, 100)}%`;
    }
    renderChart();
}

// renderChart()         → draw the doughnut chart
function renderChart() {
  if (doughnutChart) {
    doughnutChart.destroy();
        doughnutChart = null;
    }

    if (incAmt === 0 && speAmt === 0) {
        chartWrap.style.display = "none";
        chartEmptyState.style.display = "block";
        return;
    }
    chartEmptyState.style.display = "none";
    chartWrap.style.display = "block";
  doughnutChart = new Chart(doughnutCanvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [Number(incAmt), Number(speAmt)],
          backgroundColor: ["#49de80", "#f77272"],
          borderColor: "#0f0f1a",
          borderWidth: 2,
          hoverOffset: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#f7fcfc",
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            // label: (ctx) => `${ctx.label}: ₦${ctx.raw.toLocaleString("en-NG")}`,
          },
        },
      },
    },
  });
  // if (!doughnutChart) {
  //   return;
  // }
}

// filterTransactions()  → filter by type or category
function filterTransactions(type, tab) {
    if (type === "all") {
        if (transactions.length === 0) {
            tab.innerHTML = `<li class="empty-state">No transactions yet — add one to get started</li>`;
            const emptyState = document.querySelector(".empty-state");
            emptyState.style.display = "block";
            return;
        }
        renderTransactions(transactions, tab);
        return;
    }
    // const filtered = transactions.filter((trans) => trans.type === type);
    const filtered = transactions.filter((trans) => {
        if (trans.type === type || trans.category === type) {
            return trans;
        } 
    });

    if (filtered.length === 0) {
        tab.innerHTML = `<li class="empty-state empty-state-income">No transactions found.</li>`;
        const emptyState = document.querySelector(".empty-state");
        emptyState.style.display = "block";
        return;
    }
    renderTransactions(filtered, tab);
}

// deleteTransaction()   → remove by id
function deleteTransaction(id) {
    transactions = transactions.filter((trans) => trans.id !== id);
    saveData();
    if (activeFilter === "all") {
      loadData();
    } else {
      filterTransactions(activeFilter, lists[activeFilterIndex]);
      renderSummary();
    }
}

// saveData()            → save to localStorage
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// loadData()            → load on startup
function loadData() {
    const getTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (!getTransactions || getTransactions.length === 0) {
      renderSummary();
      allTransactionList.innerHTML = `<li class="empty-state">No transactions yet — add one to get started</li>`;
      const emptyState = document.querySelector(".empty-state");
      emptyState.style.display = "block";
      return;
    }
    renderTransactions(getTransactions, allTransactionList);
}

// switchTabs()         → switch tabs
function switchTabs(tab, tabGr, i) {
    tab.forEach((other) => {
      if (other.classList.contains("active")) {
        other.classList.remove("active");
      }
    });
    tabGr.forEach((tab) => {
      tab.style.display = "none";
    });
    tab[i].classList.add("active");
    if (tabGr === tabs) {
        tabGr[i].style.display = "block";
    } else {
        tabGr[i].style.display = "flex";
    }
}

tabBtns.forEach((tabBtn, i) => {
    tabBtn.addEventListener("click", () => {
        switchTabs(tabBtns, tabs, i);
    })
})

transactionTypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        transactionTypeBtns.forEach(other => {
            if (other.classList.contains("selected")) {
                other.classList.remove("selected");
            }
            if (other.classList.contains("income-active")) {
                other.classList.remove("income-active");
            } else if (other.classList.contains("expense-active")) {
                other.classList.remove("expense-active");
            }
        })
        btn.classList.add("selected");
        if (btn.value === "income") {
            btn.classList.add("income-active");
            incomeCategory.style.display = "block";
            expenseCategory.style.display = "none";
        } else {
            btn.classList.add("expense-active")
            expenseCategory.style.display = "block";
            incomeCategory.style.display = "none";
        }
    })
})

filterTypeBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        filterTypeBtns.forEach(other => {
            if (other.classList.contains("active")) {
                other.classList.remove("active");
            }
        })
        btn.classList.add("active");
        lists.forEach(list => {
            list.style.display = "none";
        })

        activeFilter = filterTypes[i];
        activeFilterIndex = i;

        lists[i].style.display = "flex";
        filterTransactions(filterTypes[i], lists[i]);
        switchTabs(filterTypeBtns, lists, i)
    })
})

addTransactionBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addTransaction();
});

incomeCategory.addEventListener("change", () => {
  value = incomeCategory.value;
  text = incomeCategory.options[incomeCategory.selectedIndex].text;
});

expenseCategory.addEventListener("change", () => {
  value = expenseCategory.value;
  text = expenseCategory.options[expenseCategory.selectedIndex].text;
});



loadData(transactions);
