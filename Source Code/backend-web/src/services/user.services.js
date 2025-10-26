import cardRepository from "../repository/cardRepository.js";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";

export const test = async (req, res) => {
  // const card = await cardRepository.findById(6);
  // console.log(card);

  // res.send(card);
  // return card

  //   const newSessionData = {
  //     timeStart: "2025-10-23T08:30:00Z",
  //     licensePlate: "29A-999.99",
  //     cardId: 6,
  //     imageUrl: "https://example.com/images/xe_29a_99999.jpg",
  //     amount: 50000, // Sử dụng biến amount (không hardcode)
  //     timeEnd: null,
  //   };
  //   const savedSession = await parkingSessionRepository.create(newSessionData);
  //   res.send(savedSession);
  res.send("API is working");
};

export default {
  test,
};
