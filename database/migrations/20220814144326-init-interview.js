'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING, TEXT, UUID, UUIDV4 } = Sequelize;
    await queryInterface.createTable('interviews', {
      id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: STRING(60),
      interviewerId: {
        type: UUID,
        allowNull: false,
      },
      intervieweeId: UUID,
      code: TEXT,
      time: DATE,
      timerange: INTEGER,
      organization: INTEGER,
      job: STRING(100),
      createdAt: DATE,
      updatedAt: DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interviewa');
  },
};
