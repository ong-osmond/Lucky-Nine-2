$(document).ready(() => {
    // Getting references to our form and input
    const signUpForm = $("form.signup");
    const emailInput = $("input#signup-email-input");
    const passwordInput = $("input#signup-password-input");
    const firstNameInput = $("input#signup-firstName-input");
    const lastNameInput = $("input#signup-lastName-input");

    // When the signup button is clicked, we validate the email and password are not blank
    signUpForm.on("submit", event => {
        event.preventDefault();
        const userData = {
            email: emailInput.val().trim(),
            // firstName: firstNameInput.val().trim(),
            // lastName: lastNameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (!userData.email || !userData.password) {
            return;
        }
        // If all values have been filled in, run the signUpUser function
        signUpUser(userData.email, userData.password);
        emailInput.val("");
        passwordInput.val("");
        // firstNameInput.val("");
        // lastNameInput.val("");
    });

    // Does a post to the signup route. If successful, close the modal
    // Otherwise we log any errors
    function signUpUser(email, password, firstName, lastName) {
        $.post("/api/signup", {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: password
            })
            .then(() => {
                $.get("/api/user_data", function(userData) {
                    let loggedInData = { user: userData.id, timestamp: Date.now() };
                    loggedInData = JSON.stringify(loggedInData);
                    localStorage.setItem('loggedInData', loggedInData);
                    loggedInData = JSON.parse(localStorage.loggedInData);
                    let userId = (loggedInData.user);
                    $("#signupModal").modal('hide');
                    $("#userName").text(`Hello, user ID: ${userId}`)
                    $("#userName").show();
                    $("#myEventsButton").show();
                    $("#allEventsButton").show();
                    $("#loginButton").hide();
                    $("#signUpButton").hide();
                    $("#logoutButton").show();
                })
            })
    }

    function handleLoginErr(err) {
        $("#alert .msg").text(err.responseJSON);
        $("#alert").fadeIn(500);
    }
});