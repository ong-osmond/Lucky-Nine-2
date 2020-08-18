// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");



module.exports = function(app) {
    // Using the passport.authenticate middleware with our local strategy.
    // If the user has valid login credentials, send them to the members page.
    // Otherwise the user will be sent an error
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.json({
            id: req.user.id
        });
    });

    // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
    // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
    // otherwise send back an error
    app.post("/api/signup", (req, res) => {
        db.User.create({
                email: req.body.email,
                password: req.body.password
            })
            .then(() => {
                res.redirect(307, "/api/login");
            })
            .catch(err => {
                res.status(401).json(err);
            });
    });

    // Route for logging user out
    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
    });

    // Route for getting some data about our user to be used client side
    app.get("/api/user_data", (req, res) => {
        if (!req.user) {
            // The user is not logged in, send back an empty object
            res.json({});
        } else {
            // Otherwise send back the user's email and id
            // Sending back a password, even a hashed password, isn't a good idea
            res.json({
                email: req.user.email,
                id: req.user.id
            });
        }
    });

    // Route for getting all events
    app.get("/api/events", function(req, res) {
        // Joining Event table to Event_Participant table
        let eventParticipantTable = db.Event_Participant;
        let eventTable = db.Event;
        eventTable.hasMany(eventParticipantTable, { foreignKey: 'event_id' });
        eventParticipantTable.belongsTo(eventTable, { foreignKey: 'id' });
        eventTable.findAll({ include: [eventParticipantTable] }).then(function(results) {
            res.json(results);
        });
    });

    // Route for getting user's events
    app.get("/api/myEvents/:id", function(req, res) {
        // Joining Event table to Event_Participant table
        let eventParticipantTable = db.Event_Participant;
        let eventTable = db.Event;
        eventTable.hasMany(eventParticipantTable, { foreignKey: 'event_id' });
        eventParticipantTable.belongsTo(eventTable, { foreignKey: 'id' });
        eventTable.findAll({ where: { createdBy: req.params.id }, include: [eventParticipantTable] }).then(function(results) {
            res.json(results);
        });
    });

    // Route for adding event
    app.post("/api/event", function(req, res) {
        db.Event.create({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            venue: req.body.venue,
            dateTime: req.body.dateTime,
            createdBy: req.body.createdBy
        }).then(function(event) {
            res.json(event);
        });
    });

    //Route for deleting event
    app.delete("/api/event/:id", function(req, res) {
        db.Event.destroy({
            where: {
                id: req.params.id
            }
        }).then(function(event) {
            res.json(event);
        });
    });

    // Route for adding event_participant
    app.post("/api/event_participant", function(req, res) {
        db.Event_Participant.create({
            event_id: req.body.event_id,
            participant_id: req.body.participant_id
        }).then(function(event) {
            res.json(event);
        });
    });

};