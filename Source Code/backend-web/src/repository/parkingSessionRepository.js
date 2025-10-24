import ParkingSession from "../models/ParkingSession.js";

// Repository pattern for ParkingSession
// Encapsulates all database queries related to parking sessions

class ParkingSessionRepository {
  // Get all parking sessions
  async findAll() {
    try {
      const sessions = await ParkingSession.findAll();
      return sessions;
    } catch (error) {
      throw new Error(`Error fetching parking sessions: ${error.message}`);
    }
  }

  // Get parking session by ID
  async findById(id) {
    try {
      const session = await ParkingSession.findByPk(id);
      return session;
    } catch (error) {
      throw new Error(`Error fetching parking session by ID: ${error.message}`);
    }
  }

  // Create a new parking session
  async create(data) {
    try {
      const session = await ParkingSession.create(data);
      return session;
    } catch (error) {
      throw new Error(`Error creating parking session: ${error.message}`);
    }
  }

  // Update parking session by ID
  async update(id, data) {
    try {
      const session = await ParkingSession.findByPk(id);
      if (!session) {
        throw new Error("Parking session not found");
      }
      await session.update(data);
      return session;
    } catch (error) {
      throw new Error(`Error updating parking session: ${error.message}`);
    }
  }

  // Delete parking session by ID
  async delete(id) {
    try {
      const session = await ParkingSession.findByPk(id);
      if (!session) {
        throw new Error("Parking session not found");
      }
      await session.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting parking session: ${error.message}`);
    }
  }

  // Find parking sessions by license plate
  async findByLicensePlate(licensePlate) {
    try {
      const sessions = await ParkingSession.findAll({
        where: { licensePlate },
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching parking sessions by license plate: ${error.message}`
      );
    }
  }

  // Find parking sessions by card ID
  async findByCardId(cardId) {
    try {
      const sessions = await ParkingSession.findAll({
        where: { cardId },
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching parking sessions by card ID: ${error.message}`
      );
    }
  }
}

export default new ParkingSessionRepository();
