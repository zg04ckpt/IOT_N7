import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

const Card = sequelize.define(
  "Card",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.TINYINT, // 0 cho thẻ ngày, 1 cho thẻ tháng, null cho thẻ chưa dùng
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "cards",
    timestamps: true,
  }
);

export default Card;
