document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector('.menu-icon');
    const menuLinks = document.querySelector('.menu-links'); // Corrected targeting
    const heroSection = document.querySelector('.hero');

    // ✅ Toggle menu visibility correctly
    if (menuIcon && menuLinks) {
        menuIcon.addEventListener('click', () => {
            menuLinks.classList.toggle('active'); // Toggle menu properly
        });
    }

    // ✅ Add video background
    heroSection.innerHTML = `
        <video id="backgroundVideo" autoplay loop muted playsinline>
            <source src="background-video.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <h1>Unlock Memories, Create Moments</h1>
            <p>Welcome to PastPocket, where you can create, store, and unlock personal memories at meaningful locations.</p>
            <a href="createloc.html" class="cta-btn">+ Create Your Time Capsule</a>
        </div>
    `;

    // ✅ Style video properly
    const videoElement = document.getElementById('backgroundVideo');
    Object.assign(videoElement.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: "-1"
    });

    // ✅ Blur effect on video overlay
    const overlay = document.querySelector('.hero-overlay');
    Object.assign(overlay.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
        backdropFilter: "blur(8px)", // Blur effect
        zIndex: "-1"
    });

    // ✅ Handle authentication status
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("✅ User is logged in:", user.email);

            // ✅ Add Logout Button to Menu
            if (menuLinks && !document.getElementById("logoutLink")) {
                const logoutItem = document.createElement("li");
                logoutItem.innerHTML = '<a href="#" id="logoutLink" onclick="logout()">Logout</a>';
                menuLinks.appendChild(logoutItem);
            }
        } else {
            console.log("❌ User is NOT logged in.");
        }
    });
});

// ✅ Logout Function
function logout() {
    firebase.auth().signOut().then(() => {
        alert("Logged out successfully!");
        window.location.href = "signlocation.html"; // Redirect to login page
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
}

// ✅ Redirect User Based on Authentication Status
function checkAndRedirect(page) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            setTimeout(() => {
                window.location.href = page;
            }, 500); // Small delay for stability
        } else {
            window.location.href = "signlocation.html"; // Redirect to login if not logged in
        }
    });
}


// Toggle Chat UI
function toggleChat() {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
}

// Handle Send Button
function handleChat() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatLog = document.getElementById("chatLog");

    if (!userInput) return;

    appendMessage("You", userInput);
    const response = getBotResponse(userInput.toLowerCase());
    appendMessage("PastPocket", response);

    document.getElementById("userInput").value = "";
}

// Append Messages to Chat
function appendMessage(sender, message) {
    const chatLog = document.getElementById("chatLog");
    const msg = document.createElement("div");
    msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
    msg.style.marginBottom = "10px";
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Handle Enter Key
function handleEnter(e) {
    if (e.key === "Enter") handleChat();
}

// Bot Response Logic (Sample Q&A)
function getBotResponse(input) {
    const cleanedInput = input.toLowerCase();

    // Greeting detection
    const greetings = ["hi", "hello", "hey"];
    if (greetings.some(g => cleanedInput.includes(g))) {
        return "Hello! How can I help you with PastPocket today?";
    }

    // Keyword-based responses
    const keywords = [
        { key: ["capsule", "create"], response: "To create a capsule, click on 'Capsules' and fill the form with title, location, and media." },
        { key: ["upload", "media"], response: "Yes! You can upload images and videos when creating a capsule." },
        { key: ["reminder"], response: "You can set location or time-based reminders from the 'Reminders' page." },
        { key: ["login", "sign"], response: "Click on 'Login' at the top right to sign in to your account." },
        { key: ["delete", "capsule"], response: "Open your capsule list and click the 🗑️ Delete button beside the capsule." },
        { key: ["safe", "secure"], response: "Yes, your data is securely stored in Firebase with authentication." },
        { key: ["share"], response: "Capsules can be shared by enabling access to specific users (feature coming soon!)." },
        { key: ["bye", "exit"], response: "Goodbye! See you again on PastPocket." }
    ];

    for (let item of keywords) {
        if (item.key.some(k => cleanedInput.includes(k))) {
            return item.response;
        }
    }

    return "Hmm, I'm not sure I understand. Try asking about 'capsules', 'media', 'reminders', or 'login'.";
}

