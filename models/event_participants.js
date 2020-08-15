module.exports = function(sequelize, DataTypes) {
    const Event_Participant = sequelize.define("Event_Participant", {
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        participant_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 500]
            }
        }
    });
    return Event_Participant;
};