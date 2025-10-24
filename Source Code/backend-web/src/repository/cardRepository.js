import Card from "../models/Card.js";

// Repository pattern for Card
// Encapsulates all database queries related to cards

class CardRepository {
  // Get all cards
  async findAll() {
    try {
      const cards = await Card.findAll();
      return cards;
    } catch (error) {
      throw new Error(`Error fetching cards: ${error.message}`);
    }
  }

  // Get card by ID
  async findById(id) {
    try {
      const card = await Card.findByPk(id);
      return card;
    } catch (error) {
      throw new Error(`Error fetching card by ID: ${error.message}`);
    }
  }

  // Get card by card number
  async findByCardNumber(cardNumber) {
    try {
      const card = await Card.findOne({ where: { cardNumber } });
      return card;
    } catch (error) {
      throw new Error(`Error fetching card by card number: ${error.message}`);
    }
  }

  // Create a new card
  async create(data) {
    try {
      const card = await Card.create(data);
      return card;
    } catch (error) {
      throw new Error(`Error creating card: ${error.message}`);
    }
  }

  // Update card by ID
  async update(id, data) {
    try {
      const card = await Card.findByPk(id);
      if (!card) {
        throw new Error("Card not found");
      }
      await card.update(data);
      return card;
    } catch (error) {
      throw new Error(`Error updating card: ${error.message}`);
    }
  }

  // Delete card by ID
  async delete(id) {
    try {
      const card = await Card.findByPk(id);
      if (!card) {
        throw new Error("Card not found");
      }
      await card.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting card: ${error.message}`);
    }
  }
}

export default new CardRepository();
