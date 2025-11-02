import parkingSessionRepository from "../repository/parkingSessionRepository.js";

export const getAllParkingSessions = async (req, res) => {
  try {
    const sessions = await parkingSessionRepository.findAll();
    console.log(sessions);

    const sessionsWithFullImageUrl = sessions.map((session) => {
      const sessionData = session.dataValues || session;
      const cardData = sessionData.cardInfo || null;

      const isMonthlyCard = cardData && cardData.type === 1;

      return {
        ...sessionData,
        imageUrl: sessionData.imageUrl
          ? `${req.protocol}://${req.get("host")}${sessionData.imageUrl}`
          : sessionData.imageUrl,
        cardInfo: cardData,
        isMonthlyCard: isMonthlyCard,
      };
    });

    res.status(200).json({
      success: true,
      data: sessionsWithFullImageUrl,
      message: "Parking sessions retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParkingSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await parkingSessionRepository.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found",
      });
    }

    const sessionData = session.dataValues || session;
    const cardData = sessionData.cardInfo || null;

    const isMonthlyCard = cardData && cardData.type === 1;

    const sessionWithFullImageUrl = {
      ...sessionData,
      imageUrl: sessionData.imageUrl
        ? `${req.protocol}://${req.get("host")}${sessionData.imageUrl}`
        : sessionData.imageUrl,
      cardInfo: cardData,
      isMonthlyCard: isMonthlyCard,
    };

    res.status(200).json({
      success: true,
      data: sessionWithFullImageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createParkingSession = async (req, res) => {
  try {
    const session = await parkingSessionRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: session,
      message: "Parking session created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateParkingSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await parkingSessionRepository.update(id, req.body);
    res.status(200).json({
      success: true,
      data: session,
      message: "Parking session updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteParkingSession = async (req, res) => {
  try {
    const { id } = req.params;
    await parkingSessionRepository.delete(id);
    res.status(200).json({
      success: true,
      message: "Parking session deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParkingSessionsByLicensePlate = async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const sessions = await parkingSessionRepository.findByLicensePlate(
      licensePlate
    );

    const sessionsWithFullImageUrl = sessions.map((session) => {
      const sessionData = session.dataValues || session;
      const cardData = sessionData.cardInfo || null;

      const isMonthlyCard = cardData && cardData.type === 1;

      return {
        ...sessionData,
        imageUrl: sessionData.imageUrl
          ? `${req.protocol}://${req.get("host")}${sessionData.imageUrl}`
          : sessionData.imageUrl,
        cardInfo: cardData,
        isMonthlyCard: isMonthlyCard,
      };
    });

    res.status(200).json({
      success: true,
      data: sessionsWithFullImageUrl,
      message: "Parking sessions retrieved by license plate",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParkingSessionsByCardId = async (req, res) => {
  try {
    const { cardId } = req.params;
    const sessions = await parkingSessionRepository.findByCardId(cardId);

    const sessionsWithFullImageUrl = sessions.map((session) => {
      const sessionData = session.dataValues || session;
      const cardData = sessionData.cardInfo || null;

      const isMonthlyCard = cardData && cardData.type === 1;

      return {
        ...sessionData,
        imageUrl: sessionData.imageUrl
          ? `${req.protocol}://${req.get("host")}${sessionData.imageUrl}`
          : sessionData.imageUrl,
        cardInfo: cardData,
        isMonthlyCard: isMonthlyCard,
      };
    });

    res.status(200).json({
      success: true,
      data: sessionsWithFullImageUrl,
      message: "Parking sessions retrieved by card ID",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllParkingSessions,
  getParkingSessionById,
  createParkingSession,
  updateParkingSession,
  deleteParkingSession,
  getParkingSessionsByLicensePlate,
  getParkingSessionsByCardId,
};
