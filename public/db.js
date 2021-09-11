let db;
let budgetVer;

const request = indexedDB.open("BudgetDB", budgetVer || 21);

request.onupgradeneeded = function (e) {
  console.log("upgrade needed.");
  console.log("Updating");
  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log("Error!" + e);
};

function checkDB() {
  console.log("Checking DB");
  let transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");
            const currentStore = transaction.objectStore("BudgetStore");
            currentStore.clear();
            console.log("Clearing store");
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("request successful ");
  db = e.target.result;
  if (navigator.onLine) {
    console.log("Server reachable");
    checkDB();
  }
};

const saveRecord = (record) => {
  console.log("Saving record");
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  store.add(record);
};

window.addEventListener('online', checkDB)