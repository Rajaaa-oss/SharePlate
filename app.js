const getData = (key) => {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

let donations = getData("shareplate_donations");
let requests = getData("shareplate_requests");

const form = document.getElementById("donationForm");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const food = {
      id: Date.now(),
      name: document.getElementById("foodName").value,
      quantity: document.getElementById("quantity").value,
      category: document.getElementById("category").value,
      location: document.getElementById("location").value,
      expiry: document.getElementById("expiry").value,
      status: "Available"
    };

    donations.push(food);
    saveData("shareplate_donations", donations);

    form.reset();
    renderAll();

    alert("Food donation added successfully!");
  });
}

function renderFood() {
  const list = document.getElementById("foodList");
  if (!list) return;

  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter").value;

  list.innerHTML = "";

  const available = donations.filter(food => {
    return food.status === "Available" &&
      food.name.toLowerCase().includes(search) &&
      (filter === "All" || food.category === filter);
  });

  if (available.length === 0) {
    list.innerHTML = "<p>No available food found.</p>";
    return;
  }

  available.forEach(food => {
    const card = document.createElement("div");
    card.className = "feature-card";

    card.innerHTML = `
      <h3>🍱 ${food.name}</h3>
      <p>Quantity: ${food.quantity}</p>
      <p>Category: ${food.category}</p>
      <p>📍 ${food.location}</p>
      <p>Expiry: ${food.expiry}</p>
      <button class="primary-btn"
        onclick="requestFood(${food.id})">
        Request Food
      </button>
    `;

    list.appendChild(card);
  });
}

function requestFood(id) {
  const food = donations.find(item => item.id === id);

  if (!food || food.status !== "Available") return;

  const confirmed = confirm("Do you want to request this food?");

  if (!confirmed) return;

  requests.push({
    id: Date.now(),
    foodId: id,
    foodName: food.name,
    location: food.location,
    status: "Pending"
  });

  food.status = "Requested";

  saveData("shareplate_donations", donations);
  saveData("shareplate_requests", requests);

  renderAll();
  alert("Food request submitted!");
}

function renderHistory() {
  const history = document.getElementById("history");
  if (!history) return;

  history.innerHTML = "";

  if (donations.length === 0) {
    history.innerHTML = "<p>No donation history yet.</p>";
    return;
  }

  donations.forEach(food => {
    const card = document.createElement("div");
    card.className = "feature-card";

    card.innerHTML = `
      <h3>${food.name}</h3>
      <p>Quantity: ${food.quantity}</p>
      <p>Status: ${food.status}</p>
    `;

    history.appendChild(card);
  });
}

function renderAdmin() {
  document.getElementById("totalDonations").textContent =
    donations.length;

  document.getElementById("totalRequests").textContent =
    requests.length;

  document.getElementById("totalAvailable").textContent =
    donations.filter(f => f.status === "Available").length;

  const container = document.getElementById("adminRequests");
  if (!container) return;

  container.innerHTML = "";

  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "feature-card";

    card.innerHTML = `
      <h3>${req.foodName}</h3>
      <p>Request status: ${req.status}</p>
      <button class="primary-btn"
        onclick="updateRequest(${req.id}, 'Approved')">
        Approve
      </button>
      <button class="primary-btn"
        onclick="updateRequest(${req.id}, 'Rejected')">
        Reject
      </button>
    `;

    container.appendChild(card);
  });
}

function updateRequest(id, status) {
  const req = requests.find(r => r.id === id);
  if (!req || req.status !== "Pending") return;

  req.status = status;

  const food = donations.find(f => f.id === req.foodId);

  if (food) {
    food.status = status === "Approved"
      ? "Completed"
      : "Available";
  }

  saveData("shareplate_requests", requests);
  saveData("shareplate_donations", donations);

  renderAll();
}

function renderAll() {
  renderFood();
  renderHistory();
  renderAdmin();
}

document.getElementById("search")?.addEventListener(
  "input", renderFood
);

document.getElementById("filter")?.addEventListener(
  "change", renderFood
);

renderAll();