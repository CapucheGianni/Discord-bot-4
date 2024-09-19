'use strict';

const { DataTypes } = require('sequelize');
const { resolveColor } = require('discord.js')

require('dotenv').config()

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jokes: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      banned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: 'en',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Server', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      prefix: {
        type: Sequelize.STRING(5),
        defaultValue: 'k!',
        allowNull: false
      },
      jokes: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Channel', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      jokes: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      serverId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Server',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('AnnouncementChannel', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      message: {
        type: DataTypes.STRING(1900),
        allowNull: true
      },
      dm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isActivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      embedEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      serverId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Server',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Channel',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('AnnouncementEmbed', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: '#FFFFFF',
        validate: {
          isColorResolvable(value) {
            try {
              resolveColor(value)
            } catch (error) {
              throw Error('Invalid color.')
            }
          }
        },
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(256),
        allowNull: false
      },
      displayBody: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING(2048),
        allowNull: true
      },
      displayImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      displayFooter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      footer: {
        type: DataTypes.STRING(2048),
        allowNull: true
      },
      displayThumbnail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      displayTimestamp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      announcementChannelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'AnnouncementChannel',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('EmbedField', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(256),
        unique: true,
        allowNull: false
      },
      value: {
        type: DataTypes.STRING(1024),
        allowNull: true
      },
      inline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      embedId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'AnnouncementEmbed',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('Interaction', {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Command', {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('TwitchNotification', {
      serverId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      streamer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      channelId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      roleId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      message: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      updateMessage: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      isStreaming: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      game: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      serverId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Server',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Channel',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('Bot', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      maintenance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Pun', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      idInServer: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      toFind: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isSingleWord(value) {
            const trimmedValue = value.trim()
            if (trimmedValue.includes(' ') || trimmedValue.includes('\t'))
              throw Error('\'toFind\' doit être un seul et unique mot sans espace.')
          }
        }
      },
      toAnswer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      serverId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Server',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User');
    await queryInterface.dropTable('Server');
    await queryInterface.dropTable('Channel');
    await queryInterface.dropTable('AnnouncementChannel');
    await queryInterface.dropTable('AnnouncementEmbed');
    await queryInterface.dropTable('EmbedField');
    await queryInterface.dropTable('Interaction');
    await queryInterface.dropTable('Command');
    await queryInterface.dropTable('TwitchNotification');
    await queryInterface.dropTable('Bot');
    await queryInterface.dropTable('Pun');
  }
};
