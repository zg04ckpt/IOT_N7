import ParkingSession from "../models/ParkingSession.js";
import Card from "../models/Card.js";
import { Op } from "sequelize";

class ParkingSessionRepository {
  async findAll() {
    try {
      const sessions = await ParkingSession.findAll({
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return sessions;
    } catch (error) {
      throw new Error(`Error fetching parking sessions: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const session = await ParkingSession.findByPk(id, {
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return session;
    } catch (error) {
      throw new Error(`Error fetching parking session by ID: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const session = await ParkingSession.create(data);
      return session;
    } catch (error) {
      throw new Error(`Error creating parking session: ${error.message}`);
    }
  }

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

  async findByLicensePlate(licensePlate) {
    try {
      const sessions = await ParkingSession.findAll({
        where: { licensePlate },
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching parking sessions by license plate: ${error.message}`
      );
    }
  }

  async findByCardId(cardId) {
    try {
      const sessions = await ParkingSession.findAll({
        where: { cardId },
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching parking sessions by card ID: ${error.message}`
      );
    }
  }

  async getListSessionCurrent() {
    try {
      const sessions = await ParkingSession.findAll({
        where: { timeEnd: null },
        order: [["timeStart", "DESC"]],
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching current parking sessions: ${error.message}`
      );
    }
  }

  async getListSessionHistory() {
    try {
      const sessions = await ParkingSession.findAll({
        where: {
          timeEnd: {
            [Op.not]: null,
          },
        },
        order: [["timeEnd", "DESC"]],
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching parking session history: ${error.message}`
      );
    }
  }

  async findActiveSessions() {
    try {
      const sessions = await ParkingSession.findAll({
        where: { timeEnd: null },
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return sessions;
    } catch (error) {
      throw new Error(
        `Error fetching active parking sessions: ${error.message}`
      );
    }
  }

  //  Tìm xe theo licensePlate, cardId và timeEnd = null
  async findByLicensePlateAndCardIdAndActive(licensePlate, cardId) {
    try {
      const session = await ParkingSession.findOne({
        where: {
          licensePlate: licensePlate,
          cardId: parseInt(cardId, 10),
          timeEnd: null, 
        },
        include: [
          {
            model: Card,
            as: "cardInfo",
            attributes: ["id", "type", "cardNumber", "price", "isActive"],
          },
        ],
      });
      return session;
    } catch (error) {
      throw new Error(
        `Error fetching parking session by licensePlate and cardId: ${error.message}`
      );
    }
  }
}

export default new ParkingSessionRepository();
