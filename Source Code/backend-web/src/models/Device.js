import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

const Device = sequelize.define(
  "Device",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isConnect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "devices",
    timestamps: true,
  }
);

export default Device;
