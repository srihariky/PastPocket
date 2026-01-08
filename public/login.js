// ✅ Handle Sign Up
document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Account created successfully!");
            window.location.href = "createloc.html";
        })
        .catch((error) => {
            alert("❌ " + error.message);
        });
});

// ✅ Handle Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Login successful!");
            window.location.href = "createloc.html";
        })
        .catch((error) => {
            alert("❌ " + error.message);
        });
});

// ✅ Handle Password Reset
document.getElementById("forgotPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let email = document.getElementById("reset-email").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("✅ Password reset email sent! Check your inbox."))
        .catch((error) => alert("❌ " + error.message));
});
