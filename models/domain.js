const Sequelize = require('sequelize');

module.exports = class Domain extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        // 인터넷 주소
        host: { type: Sequelize.STRING(80), allowNull: false },
        // 도메인 종류
        // ENUM : 넣을 수 있는 값을 제한하는 데이터 형식, 어기면 에러 발생
        type: { type: Sequelize.ENUM('free', 'premium') }, // free, premium 둘 중 하나만 선택 가능
        // 클라이언트 비밀키 : 다른 개발자들이 API 사용시 필요한 비밀 키, 유출되면 다른 사람을 사칭해서 요청 가능
        clientSecret: {
          type: Sequelize.UUID, // UUID 충돌 가능성이 매우 적은 랜덤 문자열
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Domain',
        tableName: 'domains',
      }
    );
  }

  static associate(db) {
    db.Domain.belongsTo(db.User);
  }
};
