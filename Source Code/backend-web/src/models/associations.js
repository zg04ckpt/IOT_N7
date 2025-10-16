import Card from "./Card.js";
import ParkingSession from "./ParkingSession.js";

// Card vs ParkingSession
Card.hasMany(ParkingSession, {
  foreignKey: "cardId",
  as: "parkingSessions",
});

ParkingSession.belongsTo(Card, {
  foreignKey: "cardId",
  as: "cardInfo",
});
