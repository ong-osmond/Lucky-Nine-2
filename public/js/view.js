/*jshint esversion: 6 */
$(document).ready(function () {

    // Getting a reference to the input field where user adds a new event
    var $newEventTitle = $(".new-event-title");
    var $newEventDesription = $(".new-event-description");
    var $newEventVenue = $(".new-event-venue");
    var $newEventCategory = $(".new-event-category");
    var $newEventDateTime = $(".new-event-dateTime");
    $("#myEventsButton").on("click", getMyEvents);
    $("#allEventsButton").on("click", getEvents);
    // Our new events will go inside the eventContainer
    var eventContainer = $(".event-container");
    // Adding event listeners for deleting, editing, and adding events
    $(document).on("click", "button.delete", deleteEvent);
    $(document).on("click", "button.join", joinEvent);
    //$(document).on("click", ".event-item", editEvent);
    //$(document).on("keyup", ".event-item", finishEdit);
    //$(document).on("blur", ".event-item", cancelEdit);
    $(document).on("submit", "#event-form", insertEvent);

    // Callback function to retrieve the current IP
    function getJoinEventID() {
        $.getJSON("http://jsonip.com/?callback=?", function (data) {
            return data.ip;
        });
    }

    // Our initial events array
    var events = [];

    // Getting events from database when page loads
    // getEvents();

    // This function checks if the user is already logged in and displays the appropriate elements
    function displayItemsWhenLoggedIn() {
        if (localStorage.loggedInData) {
            let loggedInData = JSON.parse(localStorage.loggedInData);
            let userId = (loggedInData.user);
            $("#userName").text(`Hello, user ID: ${userId}`)
            $("#userName").show();
            $("#loginButton").hide();
            $("#signUpButton").hide();
            $("#logoutButton").show();
            $("#myEventsButton").show();
            $("#allEventsButton").show();
        }
    }

    // This function resets the events displayed with new events from the database
    function initializeRows() {
        eventContainer.empty();
        var rowsToAdd = [];
        for (var i = 0; i < events.length; i++) {
            rowsToAdd.push(createNewRow(events[i]));
        }
        eventContainer.prepend(rowsToAdd);
    }

    // This function grabs events from the database and updates the view
    function getEvents() {
        $.get("/api/events", function (data) {
            events = data;
            console.log(events);
            initializeRows();
        });
    }

    // This function grabs the user's events
    function getMyEvents() {
        let loggedInData = JSON.parse(localStorage.loggedInData);
        let userId = (loggedInData.user);
        console.log(`Sending this api route request for myEvents : /api/myEvents/${userId}`);
        $.get(`/api/myEvents/${userId}`, function (data) {
            events = data;
            initializeRows();
        });
    }


    // This function deletes a event when the user clicks the delete button
    function deleteEvent(event) {
        event.stopPropagation();
        var id = $(this).data("id");
        console.log(id);
        $.ajax({
            method: "DELETE",
            url: "/api/event/" + id
        }).then(getMyEvents);
    }

    // This function handles showing the input box for a user to edit a event
    function editEvent() {
        var currentEvent = $(this).data("event");
        $(this).children().hide();
        $(this).children("input.edit").val(currentEvent.text);
        $(this).children("input.edit").show();
        $(this).children("input.edit").focus();
    }

    // Adds the current user as a participant to the event
    function joinEvent(event) {
        event.preventDefault();
        if (localStorage.loggedInData) {
            event.stopPropagation();
            let loggedInData = JSON.parse(localStorage.loggedInData);
            let userId = (loggedInData.user);
            let eventToJoin = $(this).parent().data("event");
            var event_participant = {
                event_id: eventToJoin.id,
                participant_id: userId
            };
            $.post("/api/event_participant", event_participant, getEvents);
        } else { alert("Please log in or sign up to join an event!"); }
    }

    // This function formats the date and time to AM/PM format
    function formatAMPM(date) {
        var date = new Date(date);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }


    // This function constructs a event-item row
    function createNewRow(event) {
        var localEventDateTime = formatAMPM(event.dateTime);
        var newInputRow = $(
            [
                `<li class='list-group-item event-item'>
          <span>
          <b> ${event.title} </b>
          <br> ${event.description}
          <br> Venue: ${event.venue}
          <br> Local Date and Time: ${localEventDateTime}
          <br> Category: ${event.category}
          <br> Number of participants: ${event.Event_Participants.length}
          <br> Created by user id: ${event.createdBy}
          </span>
          <br>
          <p></p> 
          <input type='text' class='edit' style='display: none;'>
          <button class='join btn btn-primary'>Join!</button>
          <button class='delete btn btn-danger'>Delete Event</button>
          </li>`
            ].join("")
        );
        newInputRow.find("p").data("id", event.id);
        newInputRow.find("button.delete").data("id", event.id);
        newInputRow.find("input.edit").css("display", "none");
        // Check if Delete button is accessible
        if (localStorage.loggedInData) {
            let loggedInData = JSON.parse(localStorage.loggedInData);
            let userId = (loggedInData.user);
            if (userId == event.createdBy) {
                newInputRow.find("button.delete").show();
            } else {
                newInputRow.find("button.delete").hide()
            };
        } else {
            newInputRow.find("button.delete").hide()
        }
        // Check if Join button is accessible
        if (localStorage.loggedInData) {
            let loggedInData = JSON.parse(localStorage.loggedInData);
            let userId = (loggedInData.user);
            // Check if user is a participant
            let eventToJoin = event;
            for (i = 0; i < event.Event_Participants.length; i++) {
                var eventParticipants = [];
                eventParticipants.push(parseInt(eventToJoin.Event_Participants[i].participant_id));
                if (eventParticipants === undefined ||
                    !eventParticipants.includes(userId) ||
                    userId != eventToJoin.createdBy) {
                    newInputRow.find("button.join").show();
                } else {
                    newInputRow.find("button.join").hide();
                    newInputRow.find("p").text("Thank you for joining this event.");
                }
                if (userId == event.createdBy || eventParticipants.includes(userId)) {
                    newInputRow.find("button.join").hide();
                    newInputRow.find("p").text("Thank you for joining this event.");
                };
            }
        } else {
            newInputRow.find("button.join").show();
        }
        newInputRow.data("event", event);
        if (event.complete) {
            newInputRow.find("span").css("text-decoration", "line-through");
        }
        return newInputRow;
    }

    // This function inserts a new event into our database and then updates the view
    function insertEvent(event) {
        event.preventDefault();
        // Retrieve the credentials of the user
        if (localStorage.loggedInData) {
            let loggedInData = JSON.parse(localStorage.loggedInData);
            let userId = (loggedInData.user);
            var event = {
                title: $newEventTitle.val(),
                description: $newEventDesription.val(),
                venue: $newEventVenue.val(),
                category: $newEventCategory.val(),
                dateTime: $newEventDateTime.val(),
                createdBy: userId
            };
            $.post("/api/event", event, getMyEvents);
        } else { alert("Please log in or sign up to add an event!"); }
    }

    getEvents();
    displayItemsWhenLoggedIn();

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

    // Log in the user
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
                $("#userName").text(`
                                Hello, user ID: ${userId}
                                `)
                $("#userName").show();
                $("#myEventsButton").show();
                $("#allEventsButton").show();
                $("#loginButton").hide();
                $("#signUpButton").hide();
                $("#logoutButton").show();
                getMyEvents();
            })
    }

    // Log out the user
    $('#logoutButton').on('click', function () {
        let userData = {};
        localStorage.clear();
        $.get("logout", function (data) {
            $("#loginButton").show();
            $("#signUpButton").show();
            $("#logoutButton").hide();
            $("#userName").hide();
            $("#myEventsButton").hide();
            $("#allEventsButton").hide();
        });
        getEvents();
    })

    $('#searchButton').on('click', function () {
        console.log("Logout button clicked");
        let term = $("#searchTerm").val();
        searchEvents(term);
    })

    function searchEvents(term) {
        event.preventDefault();
        $.get(`/api/event/search/${term}`, function (data) {
            events = data;
            initializeRows();
        });
    }

});