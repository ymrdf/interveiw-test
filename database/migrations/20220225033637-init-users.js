'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 users 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING, TEXT, UUID, UUIDV4 } = Sequelize;
    await queryInterface.createTable('users', {
      id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: STRING(60),
        unique: true,
      },
      nickname: STRING(60),
      email: STRING(100),
      phone: STRING(60),
      avatar: TEXT,
      password: STRING(128),
      organization: INTEGER,
      role: INTEGER,
      age: INTEGER,
      birthday: INTEGER,
      gender: INTEGER,
      job: STRING(100),
      createdAt: DATE,
      updatedAt: DATE,
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
