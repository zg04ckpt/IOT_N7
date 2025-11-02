import Card from "../models/Card.js";

class CardRepository {
  async findAll() {
    try {
      const cards = await Card.findAll();
      return cards;
    } catch (error) {
      throw new Error(`Error fetching cards: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const card = await Card.findByPk(id);
      return card;
    } catch (error) {
      throw new Error(`Error fetching card by ID: ${error.message}`);
    }
  }

  async findByCardNumber(cardNumber) {
    try {
      const card = await Card.findOne({ where: { cardNumber } });
      return card;
    } catch (error) {
      throw new Error(`Error fetching card by card number: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const card = await Card.create(data);
      return card;
    } catch (error) {
      throw new Error(`Error creating card: ${error.message}`);
    }
  }

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
