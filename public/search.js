const db = firebase.firestore();

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");
const locationFilter = document.getElementById("locationFilter");

let allCapsules = [];

// Fetch all capsules on page load
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const snapshot = await db.collection("capsules").orderBy("timestamp", "desc").get();
        allCapsules = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        populateLocationDropdown(allCapsules);
        displayResults(allCapsules);
    } catch (error) {
        console.error("Error fetching capsules:", error);
    }
});

// Populate location filter
function populateLocationDropdown(capsules) {
    const locations = [...new Set(capsules.map(c => c.location))];
    locations.forEach(loc => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        locationFilter.appendChild(option);
    });
}

// Display capsules
function displayResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
        searchResults.innerHTML = "<p>No matching capsules found.</p>";
        return;
    }

    results.forEach(capsule => {
        const div = document.createElement("div");
        div.classList.add("capsule-result");

        const mediaPreview = (capsule.mediaUrls && capsule.mediaUrls.length > 0)
            ? capsule.mediaUrls.map(url =>
                `<img src="${url}" alt="media" style="max-height: 80px; margin-right: 10px; border-radius: 5px;">`
            ).join("")
            : "<p><em>No media</em></p>";

        div.innerHTML = `
      <h3>${capsule.title}</h3>
      <p>${capsule.description}</p>
      <p><strong>Date:</strong> ${capsule.date}</p>
      <p><strong>Location:</strong> ${capsule.location}</p>
      <p><strong>Radius:</strong> ${capsule.radius || "350"} meters</p>
      <div>${mediaPreview}</div>
      <hr>
    `;

        searchResults.appendChild(div);
    });
}

// Filter logic
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    const location = locationFilter.value;

    const filtered = allCapsules.filter(capsule => {
        const matchesQuery = (
            capsule.title.toLowerCase().includes(query) ||
            capsule.description.toLowerCase().includes(query) ||
            capsule.location.toLowerCase().includes(query)
        );

        const matchesLocation = location ? capsule.location === location : true;

        return matchesQuery && matchesLocation;
    });

    displayResults(filtered);
});
