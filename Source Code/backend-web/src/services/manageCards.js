import cardRepository from "../repository/cardRepository.js";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";

export const getAllCards = async (req, res) => {
  try {
    const cards = await cardRepository.findAll();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách thẻ thành công",
      data: cards,
      total: cards.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const getCardById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    const card = await cardRepository.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin thẻ thành công",
      data: card,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const searchCardByNumber = async (req, res) => {
  try {
    const { cardNumber } = req.params;

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu số thẻ để tìm kiếm",
      });
    }

    const card = await cardRepository.findByCardNumber(cardNumber);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tìm thẻ thành công",
      data: card,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const createCard = async (req, res) => {
  try {
    const { cardNumber, price, type } = req.body;

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin số thẻ (cardNumber)",
      });
    }

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin giá tiền của thẻ (price)",
      });
    }

    if (type === undefined || type === null) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin loại thẻ (type)",
      });
    }

    if (type !== 0 && type !== 1) {
      return res.status(400).json({
        success: false,
        message: "Loại thẻ không hợp lệ (type phải là 0 hoặc 1)",
      });
    }

    const existingCard = await cardRepository.findByCardNumber(cardNumber);
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: "Số thẻ này đã tồn tại",
      });
    }

    const cardData = {
      cardNumber: cardNumber.trim(),
      price: parseInt(price, 10),
      type: parseInt(type, 10),
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCard = await cardRepository.create(cardData);

    res.status(201).json({
      success: true,
      message: "Thêm thẻ mới thành công",
      data: newCard,
    });
  } catch (error) {
    console.error("Lỗi khi thêm thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardNumber, isActive, price, type } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    if (cardNumber && cardNumber !== existingCard.cardNumber) {
      const duplicateCard = await cardRepository.findByCardNumber(cardNumber);
      if (duplicateCard) {
        return res.status(400).json({
          success: false,
          message: "Số thẻ này đã tồn tại vui lòng chọn số thẻ khác",
        });
      }
    }

    if (type !== undefined && type !== null) {
      if (type !== 0 && type !== 1) {
        return res.status(400).json({
          success: false,
          message: "Loại thẻ không hợp lệ (type phải là 0 hoặc 1)",
        });
      }
    }

    const updateData = {};

    if (cardNumber !== undefined) {
      updateData.cardNumber = cardNumber.trim();
    }

    if (isActive !== undefined) {
      updateData.isActive =
        isActive === true || isActive === "true" || isActive === 1
          ? true
          : false;
      console.log(" isActive convert:", updateData.isActive);
    }

    if (price !== undefined) {
      updateData.price = parseInt(price, 10);
      console.log(" price convert:", updateData.price);
    }

    if (type !== undefined && type !== null) {
      updateData.type = parseInt(type, 10);
      console.log(" type convert:", updateData.type);
    }

    console.log(" Update data gửi lên repository:", updateData);

    const updatedCard = await cardRepository.update(id, updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật thẻ thành công",
      data: updatedCard,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

// export const rechargeCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { amount } = req.body;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Thiếu thông tin ID thẻ",
//       });
//     }

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Số tiền nạp không hợp lệ",
//       });
//     }

//     // Lấy thẻ hiện tại
//     const card = await cardRepository.findById(id);
//     if (!card) {
//       return res.status(404).json({
//         success: false,
//         message: "Thẻ không tồn tại",
//       });
//     }

//     // Cộng tiền vào balance
//     const newBalance = (card.balance || 0) + parseFloat(amount);

//     // Cập nhật
//     const updatedCard = await cardRepository.update(id, {
//       balance: newBalance,
//     });

//     res.status(200).json({
//       success: true,
//       message: `Nạp tiền thành công. Số dư mới: ${newBalance}`,
//       data: updatedCard,
//     });
//   } catch (error) {
//     console.error("Lỗi khi nạp tiền thẻ:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Lỗi máy chủ nội bộ",
//     });
//   }
// };

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    await cardRepository.delete(id);

    res.status(200).json({
      success: true,
      message: "Xóa thẻ thành công",
      data: { id, cardNumber: existingCard.cardNumber },
    });
  } catch (error) {
    console.error("Lỗi khi xóa thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const updateAllCardPrices = async (req, res) => {
  try {
    const updatedCards = await cardRepository.findAll();

    const { price } = req.body;

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin giá tiền của thẻ (price)",
      });
    }

    for (const card of updatedCards) {
      let newPrice = 0;
      if (card.type === 0) {
        newPrice = price;
      } else if (card.type === 1) {
        // newPrice = 150000;
        newPrice = card.price;
      }
      await cardRepository.update(card.id, { price: newPrice });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật giá thẻ thành công",
      data: updatedCards,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật giá thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

const getCardByCardNumber = async (req, res) => {
  try {
    const { cardNumber } = req.params;
    console.log("Received cardNumber:", cardNumber);
    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu số thẻ để tìm kiếm",
      });
    }

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
    console.error("Lỗi khi lấy thông tin thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const getAvailableCards = async (req, res) => {
  try {
    const allCards = await cardRepository.findAll();

    const activeSessions = await parkingSessionRepository.findActiveSessions();
    const activeCardIds = activeSessions
      .map((session) => session.cardId)
      .filter(Boolean);

    const availableCards = allCards.filter((card) => {
      return (
        card.type === 0 &&
        card.isActive === true &&
        !activeCardIds.includes(card.id)
      );
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách thẻ rảnh thành công",
      data: availableCards,
      total: availableCards.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thẻ rảnh:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  getAllCards,
  getCardById,
  searchCardByNumber,
  createCard,
  updateCard,
  // rechargeCard,
  deleteCard,
  updateAllCardPrices,
  getCardByCardNumber,
  getAvailableCards,
};
