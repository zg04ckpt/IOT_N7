import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ParkingSession = sequelize.define(
  "ParkingSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timeStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timeEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    licensePlate: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Giá tiền tính theo phút hoặc giờ"
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "parking_sessions",
    timestamps: true,
  }
);

export default ParkingSession;
