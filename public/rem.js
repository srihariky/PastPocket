// Firestore References
const remindersRef = db.collection("reminders");
const capsulesRef = db.collection("capsules");

// Global Variables
let map;
let marker;
let currentLatLng = null;
let reminderCheckerInterval = null;
let capsules = [];
let capsuleMarkers = [];
let reminderMarkers = [];

// Custom Icons
const capsuleIcon = L.icon({
    iconUrl: 'pastpocket-logo.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
});

const reminderIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
});

// Initialize Map
function initializeMap() {
    map = L.map('map').setView([19.0149, 72.8631], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.Control.geocoder().addTo(map);

    map.on('click', function (e) {
        currentLatLng = e.latlng;
        if (marker) marker.setLatLng(currentLatLng);
        else marker = L.marker(currentLatLng).addTo(map);

        document.getElementById('location').value = `${currentLatLng.lat.toFixed(5)}, ${currentLatLng.lng.toFixed(5)}`;
    });
}

// Fetch Capsules
async function fetchCapsules() {
    const snapshot = await capsulesRef.get();
    capsules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    capsules.forEach(capsule => {
        if (capsule.location) {
            const [lat, lng] = capsule.location.split(',').map(Number);
            const capMarker = L.marker([lat, lng], { icon: capsuleIcon }).addTo(map)
                .bindPopup(`🎀 <strong>${capsule.title}</strong><br><button onclick="deleteCapsule('${capsule.id}')">🗑️ Delete Capsule</button>`);
            capsuleMarkers.push(capMarker);
        }
    });
}

// Fetch Reminders
async function fetchReminders() {
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = "";

    const snapshot = await remindersRef.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        remindersList.innerHTML = "<p style='text-align:center;'>No reminders set yet.</p>";
        return;
    }

    snapshot.forEach(doc => {
        const reminder = doc.data();
        const div = document.createElement('div');
        div.classList.add('reminder-item');
        div.innerHTML = `
            <strong>${reminder.message}</strong><br>
            📍 Location: (${reminder.lat.toFixed(4)}, ${reminder.lng.toFixed(4)})<br>
            🕒 Date: ${reminder.reminderDate || 'N/A'} - Time: ${reminder.reminderTime || 'N/A'}<br>
            <button onclick="deleteReminder('${doc.id}')">🗑️ Delete Reminder</button>
            <hr>
        `;
        remindersList.appendChild(div);

        const remMarker = L.marker([reminder.lat, reminder.lng], { icon: reminderIcon }).addTo(map)
            .bindPopup(`🔵 <strong>${reminder.message}</strong><br><button onclick="deleteReminder('${doc.id}')">🗑️ Delete Reminder</button>`);
        reminderMarkers.push(remMarker);
    });
}

// Setup Set Reminder button
document.getElementById('setReminderBtn').addEventListener('click', async function () {
    const message = document.getElementById('message').value.trim();
    const reminderDate = document.getElementById('reminderDate').value;
    const reminderTime = document.getElementById('reminderTime').value;

    if (!message || !currentLatLng) {
        alert('Please enter message and pick a location!');
        return;
    }

    try {
        await remindersRef.add({
            message,
            lat: currentLatLng.lat,
            lng: currentLatLng.lng,
            reminderDate,
            reminderTime,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Reminder set successfully!');
        document.getElementById('reminderForm').reset();
        document.getElementById('location').value = '';
        await fetchReminders();
    } catch (error) {
        console.error('❌ Error setting reminder:', error);
        alert('Failed to set reminder.');
    }
});


// Delete Capsule
async function deleteCapsule(id) {
    if (confirm("Are you sure you want to delete this capsule?")) {
        await capsulesRef.doc(id).delete();
        alert("✅ Capsule deleted!");
        location.reload();
    }
}

// Delete Reminder
async function deleteReminder(id) {
    if (confirm("Are you sure you want to delete this reminder?")) {
        await remindersRef.doc(id).delete();
        alert("✅ Reminder deleted!");
        location.reload();
    }
}

// Reminder and Capsule Checkers
function startReminderAndCapsuleCheckers() {
    navigator.geolocation.watchPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Check reminders
        remindersRef.get().then(snapshot => {
            snapshot.forEach(doc => {
                const reminder = doc.data();
                const distance = getDistance(userLat, userLng, reminder.lat, reminder.lng);

                if (distance <= 100) {
                    alert(`📍 You're near your reminder: ${reminder.message}`);
                }
            });
        });

        // Check capsules
        capsules.forEach(capsule => {
            if (capsule.location) {
                const [lat, lng] = capsule.location.split(',').map(Number);
                const distance = getDistance(userLat, userLng, lat, lng);

                if (distance <= (parseFloat(capsule.radius) || 350) && !capsule.notified) {
                    alert(`🎉 Capsule Unlocked: ${capsule.title}`);
                    capsule.notified = true;
                }
            }
        });

    }, error => console.error("Geolocation Error:", error), {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    });
}

// Utility: Haversine Distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin((lon2 - lon1) * rad / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// DOM Ready
document.addEventListener("DOMContentLoaded", async function () {
    initializeMap();
    await fetchCapsules();
    await fetchReminders();
    startReminderAndCapsuleCheckers();
});
