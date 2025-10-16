import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

const UserInfo = sequelize.define(
  "UserInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    licensePlate: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "user_infos",
    timestamps: true,
  }
);

export default UserInfo;
