// Firebase Firestore Reference
const db = firebase.firestore();

// Cloudinary Config
const CLOUD_NAME = "dgofzijed";
const UPLOAD_PRESET = "xfwjkqxm";

let map;
let selectedMarker;
let uploadedMediaUrls = [];

// Initialize Map
document.addEventListener("DOMContentLoaded", function () {
    map = L.map("map").setView([19.0149, 72.8631], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);

    loadCapsules(); // ✅ Load previously saved capsules

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                map.setView([lat, lon], 15);

                selectedMarker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup("Current Location")
                    .openPopup();

                document.getElementById("location").value = `${lat}, ${lon}`;
            },
            (error) => console.warn("Geolocation error:", error.message)
        );
    }

    map.on("click", function (e) {
        const { lat, lng } = e.latlng;

        if (selectedMarker) {
            selectedMarker.setLatLng([lat, lng]);
        } else {
            selectedMarker = L.marker([lat, lng]).addTo(map);
        }

        document.getElementById("location").value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    });
});

// Upload to Cloudinary
async function uploadToCloudinary(files) {
    uploadedMediaUrls = [];
    const uploadPromises = [...files].map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.secure_url) uploadedMediaUrls.push(data.secure_url);
        } catch (error) {
            console.error("Upload Error:", error);
        }
    });

    await Promise.all(uploadPromises);
}

// Handle Capsule Submission
document.getElementById("capsuleForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value;
    const location = document.getElementById("location").value;
    const radius = document.getElementById("radius").value;
    const mediaFiles = document.getElementById("media").files;

    if (!title || !description || !date || !location) {
        alert("Please fill in all fields!");
        return;
    }

    if (mediaFiles.length > 0) {
        await uploadToCloudinary(mediaFiles);
    }

    try {
        await db.collection("capsules").add({
            title,
            description,
            date,
            location,
            radius,
            mediaUrls: uploadedMediaUrls,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Capsule saved successfully!");
        document.getElementById("capsuleForm").reset();
        uploadedMediaUrls = [];
        loadCapsules(); // Refresh markers
    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Error saving capsule. Try again!");
    }
});

// Load Capsules and Show on Map
async function loadCapsules() {
    try {
        const snapshot = await db.collection("capsules").orderBy('timestamp', 'desc').get();

        snapshot.forEach(doc => {
            const capsule = doc.data();
            if (capsule.location) {
                const [lat, lng] = capsule.location.split(',').map(Number);

                let mediaHtml = "";
                if (Array.isArray(capsule.mediaUrls)) {
                    capsule.mediaUrls.forEach(url => {
                        if (url.match(/\.(jpeg|jpg|png|gif)$/i)) {
                            mediaHtml += `<img src="${url}" style="max-width:100px; border-radius:5px; margin:5px;">`;
                        } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                            mediaHtml += `<video src="${url}" controls style="max-width:100px; border-radius:5px; margin:5px;"></video>`;
                        }
                    });
                }

                const popupHtml = `
                    <strong>${capsule.title}</strong><br>
                    <em>${capsule.description}</em><br>
                    📅 ${capsule.date}<br>
                    🎯 ${capsule.radius || 350}m radius<br>
                    ${mediaHtml}
                `;

                L.marker([lat, lng], {
                    icon: L.icon({
                        iconUrl: "pastpocket-logo.png",
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                })
                    .addTo(map)
                    .bindPopup(popupHtml);
            }
        });
    } catch (error) {
        console.error("❌ Error loading capsules:", error);
    }
}


// Sliding Menu Toggle
document.addEventListener("DOMContentLoaded", function () {
    const menuIcon = document.querySelector(".menu-icon");
    const menuLinks = document.querySelector(".menu-links");

    if (menuIcon && menuLinks) {
        menuIcon.addEventListener("click", function () {
            menuLinks.classList.toggle("active");
        });
    }
});
