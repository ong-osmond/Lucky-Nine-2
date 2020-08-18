var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const Event = sequelize.define("Event", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, 500]
            }
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: "Cleanup"
        },
        venue: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dateTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE
        }
    });
    return Event;
};
