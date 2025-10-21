import Card from "./Card.js";
import ParkingSession from "./ParkingSession.js";
import UserInfo from "./UserInfo.js";

// Card vs ParkingSession
Card.hasMany(ParkingSession, {
  foreignKey: "cardId",
  as: "parkingSessions",
});

ParkingSession.belongsTo(Card, {
  foreignKey: "cardId",
  as: "cardInfo",
});

// Card vs UserInfo
Card.hasOne(UserInfo, {
  foreignKey: "cardId",
  as: "userInfo",
  onDelete: "RESTRICT",
});

UserInfo.belongsTo(Card, {
  foreignKey: "cardId",
  as: "card",
});
