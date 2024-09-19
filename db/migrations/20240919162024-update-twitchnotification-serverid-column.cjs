'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('TwitchNotification', 'serverId', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Server',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('TwitchNotification', 'serverId', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    });
  }
};
