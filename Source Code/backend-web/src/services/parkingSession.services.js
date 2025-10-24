import parkingSessionRepository from "../repository/parkingSessionRepository.js";

// Controller for parking session endpoints
// Handles business logic and responds to HTTP requests

export const getAllParkingSessions = async (req, res) => {
  try {
    const sessions = await parkingSessionRepository.findAll();
    res.status(200).json({
      success: true,
      data: sessions,
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

    res.status(200).json({
      success: true,
      data: session,
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
    res.status(200).json({
      success: true,
      data: sessions,
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
    res.status(200).json({
      success: true,
      data: sessions,
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
