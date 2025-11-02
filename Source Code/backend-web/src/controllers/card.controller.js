import cardRepository from "../repository/cardRepository.js";

export const getAllCards = async (req, res) => {
  try {
    const cards = await cardRepository.findAll();
    res.status(200).json({
      success: true,
      data: cards,
      message: "Cards retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await cardRepository.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCardByCardNumber = async (req, res) => {
  try {
    const { cardNumber } = req.params;
    const card = await cardRepository.findByCardNumber(cardNumber);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCard = async (req, res) => {
  try {
    const card = await cardRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: card,
      message: "Card created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await cardRepository.update(id, req.body);
    res.status(200).json({
      success: true,
      data: card,
      message: "Card updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    await cardRepository.delete(id);
    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllCards,
  getCardById,
  getCardByCardNumber,
  createCard,
  updateCard,
  deleteCard,
};
