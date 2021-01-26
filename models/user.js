const Sequelize = require('sequelize');

module.exports = class User extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true, // createAt, updateAt 자동 생성
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: true, // deletedAt 자동 생성
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
  }
};
