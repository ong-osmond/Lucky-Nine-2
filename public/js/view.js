/*jshint esversion: 6 */
$(document).ready(function() {

    displayItemsWhenLoggedIn();

    // Getting a reference to the input field where user adds a new event
    var $newEventTitle = $(".new-event-title");
    var $newEventDesription = $(".new-event-description");
    var $newEventVenue = $(".new-event-venue");
    var $newEventCategory = $(".new-event-category");
    var $newEventDateTime = $(".new-event-dateTime");
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
        $.getJSON("http://jsonip.com/?callback=?", function(data) {
            return data.ip;
        });
    }

    // Our initial events array
    var events = [];

    // Getting events from database when page loads
    getEvents();

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
        $.get("/api/events", function(data) {
            events = data;
            console.log(events);
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
        }).then(getEvents);
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
        event.stopPropagation();
        var joinEventID = "";
        var event = $(this).parent().data("event");
        for (i = 0; i < event.Event_Participants.length; i++) {
            var eventParticipants = [];
            eventParticipants.push(event.Event_Participants[i].participant_id);
        }
        console.log("Event Participants:" + eventParticipants);
        $.getJSON("http://jsonip.com/?callback=?", function(data) {
            joinEventID = data.ip;
        }).then(function() {
            if (eventParticipants === undefined) {
                var event_participant = {
                    event_id: event.id,
                    participant_id: joinEventID
                };
                console.log(event_participant);
                $.post("/api/event_participant", event_participant, getEvents);
            } else if (!eventParticipants.includes(joinEventID)) {
                var event_participant = {
                    event_id: event.id,
                    participant_id: joinEventID
                };
                console.log(event_participant);
                $.post("/api/event_participant", event_participant, getEvents);
            } else alert("You have already signed up for this event!");

        })
    }

    // This function starts updating a event in the database if a user hits the "Enter Key"
    // While in edit mode
    function finishEdit(event) {
        var updatedEvent = $(this).data("event");
        if (event.which === 13) {
            updatedEvent.text = $(this).children("input").val().trim();
            $(this).blur();
            updateEvent(updatedEvent);
        }
    }

    // This function updates an event in our database
    function updateEvent(event) {
        $.ajax({
            method: "PUT",
            url: "/api/event",
            data: event
        }).then(getEvents);
    }

    // This function is called whenever a event item is in edit mode and loses focus
    // This cancels any edits being made
    function cancelEdit() {
        var currentEvent = $(this).data("event");
        if (currentEvent) {
            $(this).children().hide();
            $(this).children("input.edit").val(currentEvent.text);
            $(this).children("span").show();
            $(this).children("button").show();
        }
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
        console.log(event);
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
          <input type='text' class='edit' style='display: none;'>
          <button class='join btn btn-primary'>Join!</button>
          <button class='delete btn btn-danger'>x</button>
          </li>`
            ].join("")
        );

        newInputRow.find("button.delete").data("id", event.id);
        newInputRow.find("input.edit").css("display", "none");
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
        $.get("/api/user_data", function(data) {
            let userData = data;
            console.log(userData)
            if (userData.email !== undefined) {
                var event = {
                    title: $newEventTitle.val(),
                    description: $newEventDesription.val(),
                    venue: $newEventVenue.val(),
                    category: $newEventCategory.val(),
                    dateTime: $newEventDateTime.val(),
                    createdBy: userData.id
                };
                console.log(event);
                $.post("/api/event", event, getEvents);
                // var event_participant = {
                //     event_id: event.id,
                //     participant_id: userData.id
                // };
                // console.log(event_participant);
                // $.post("/api/event_participant", event_participant, getEvents);
            } else alert("You need to log in to add an event");
        })
    }

});