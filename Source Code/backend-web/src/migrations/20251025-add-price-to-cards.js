"use strict";

export async function up(queryInterface, Sequelize) {
  try {
    const tableDescription = await queryInterface.describeTable("cards");

    if (!tableDescription.price) {
      await queryInterface.addColumn("cards", "price", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "Giá tiền của thẻ",
      });
      console.log("Thêm cột price vào bảng cards");
    } else {
      console.log("Cột price đã tồn tại trong bảng cards");
    }
  } catch (error) {
    console.error("Lỗi khi thêm cột price vào cards:", error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    const tableDescription = await queryInterface.describeTable("cards");

    if (tableDescription.price) {
      await queryInterface.removeColumn("cards", "price");
      console.log("Xóa cột price khỏi bảng cards");
    }
  } catch (error) {
    console.error("Lỗi khi xóa cột price từ cards:", error);
    throw error;
  }
}
