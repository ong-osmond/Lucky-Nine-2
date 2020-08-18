module.exports = function (sequelize, DataTypes) {
    const Events = sequelize.define("Events", {
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
        suburb: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dateTime: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
    return Events;
};