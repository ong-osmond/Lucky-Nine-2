$(document).ready(() => {
    // Getting references to our form and inputs
    const loginForm = $("form.login");
    const emailInput = $("input#login-email-input");
    const passwordInput = $("input#login-password-input");

    // When the form is submitted, we validate there's an email and password entered
    loginForm.on("submit", event => {
        event.preventDefault();
        const userData = {
            email: emailInput.val().trim(),
            password: passwordInput.val().trim()
        };
        console.log(userData);

        if (!userData.email || !userData.password) {
            return;
        }

        // If we have an email and password we run the loginUser function and clear the form
        loginUser(userData.email, userData.password);
        emailInput.val("");
        passwordInput.val("");
    });

    // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function loginUser(email, password) {
        $.post("/api/login", {
                email: email,
                password: password
            })
            .then((userData) => {
                let loggedInData = { user: userData.id, timestamp: Date.now() };
                loggedInData = JSON.stringify(loggedInData);
                localStorage.setItem('loggedInData', loggedInData);
                loggedInData = JSON.parse(localStorage.loggedInData);
                let userId = (loggedInData.user);
                $("#loginModal").modal('hide');
                $("#userName").text(`Hello, user ID: ${userId}`)
                $("#userName").show();
                $("#loginButton").hide();
                $("#signUpButton").hide();
                $("#logoutButton").show();
            })
    }
});