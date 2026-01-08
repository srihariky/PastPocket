// ✅ Ensure Firebase is initialized before using it
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyAHItLCj4vEmC2b2IIlKZ4tQ1Wuigq8QFo",
        authDomain: "pastpocket-b24ee.firebaseapp.com",
        projectId: "pastpocket-b24ee",
        storageBucket: "pastpocket-b24ee.appspot.com",
        messagingSenderId: "1041111311431",
        appId: "1:1041111311431:web:9fc101444fea7bb5f4bd62"
    });
    console.log("✅ Firebase Initialized");
}

// ✅ Redirect to createloc.html if already logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("✅ User is logged in:", user.email);
        setTimeout(() => {
            window.location.href = "createloc.html"; // Redirect after detecting login
        }, 1000);
    }
});

// 🔹 Switch Forms
function showSignUp() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
}

function showLogin() {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}

function showForgotPassword() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "block";
}

// 🔹 Toggle Password Visibility
function togglePassword(id, element) {
    let input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        element.innerText = "Hide";
    } else {
        input.type = "password";
        element.innerText = "Show";
    }
}

// ✅ Email/Password Sign Up
document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Account created successfully!");
            alert("✅ Account created successfully!");
            setTimeout(() => {
                window.location.href = "createloc.html"; // Redirect user after signup
            }, 500);
        })
        .catch((error) => {
            alert("❌ " + error.message);
        });
});

// ✅ Email/Password Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Login successful!");
            alert("✅ Login successful!");
            setTimeout(() => {
                window.location.href = "createloc.html"; // Redirect after login
            }, 500);
        })
        .catch((error) => {
            alert("❌ " + error.message);
        });
});

// ✅ Password Reset
document.getElementById("forgotPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("reset-email").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("✅ Password reset email sent! Check your inbox."))
        .catch((error) => alert("❌ " + error.message));
});