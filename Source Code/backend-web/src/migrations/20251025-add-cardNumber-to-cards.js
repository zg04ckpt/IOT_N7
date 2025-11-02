"use strict";

export const up = async (queryInterface, Sequelize) => {
  try {
    const tableDescription = await queryInterface.describeTable("cards");

    if (!tableDescription.cardNumber) {
      await queryInterface.addColumn("cards", "cardNumber", {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      });
      console.log("✓ Added cardNumber column to cards table");
    } else {
      console.log("⚠ cardNumber column already exists in cards table");
    }
  } catch (error) {
    console.error("Error in migration up:", error.message);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    const tableDescription = await queryInterface.describeTable("cards");

    if (tableDescription.cardNumber) {
      await queryInterface.removeColumn("cards", "cardNumber");
      console.log("✓ Removed cardNumber column from cards table");
    } else {
      console.log("⚠ cardNumber column does not exist in cards table");
    }
  } catch (error) {
    console.error("Error in migration down:", error.message);
    throw error;
  }
};
