// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAHItLCj4vEmC2b2IIlKZ4tQ1Wuigq8QFo",
    authDomain: "pastpocket-b24ee.firebaseapp.com",
    projectId: "pastpocket-b24ee",
    storageBucket: "pastpocket-b24ee.appspot.com",
    messagingSenderId: "1041111311431",
    appId: "1:1041111311431:web:9fc101444fea7bb5f4bd62"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase Initialized");
}

// ✅ Toggle Password Visibility
function togglePassword(inputId, icon) {
    const passwordField = document.getElementById(inputId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}

// ✅ Login Function
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login successful!");
            window.location.href = "index.html"; // Redirect to home
        })
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
}

// ✅ Sign-Up Function
function signup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Account created successfully! You can now log in.");
            toggleForms(); // Switch back to login form
        })
        .catch((error) => {
            alert("Sign-up failed: " + error.message);
        });
}

// ✅ Toggle Between Login & Sign-Up Forms
function toggleForms() {
    document.getElementById("login-form").style.display =
        document.getElementById("login-form").style.display === "none" ? "block" : "none";
    document.getElementById("signup-form").style.display =
        document.getElementById("signup-form").style.display === "none" ? "block" : "none";
}
