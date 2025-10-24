import cardRepository from "../repository/cardRepository.js";

/**
 * QUẢN LÝ CARD (THẺ GỬI XE)
 * Cung cấp các handler để thêm, sửa, xóa, lấy danh sách card
 */

// ========== GET ==========

/**
 * Lấy tất cả các thẻ (card)
 * GET /api/manage-cards/list
 */
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



/**
 * Lấy chi tiết một thẻ theo ID
 * GET /api/manage-cards/:id
 */
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

/**
 * Tìm thẻ theo số thẻ (cardNumber)
 * GET /api/manage-cards/search/:cardNumber
 */
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

// ========== POST (CREATE) ==========

/**
 * Thêm mới một thẻ
 * POST /api/manage-cards
 * Body: { cardNumber, balance, status }
 */
export const createCard = async (req, res) => {
  try {
    const { cardNumber, balance, status } = req.body;

    // Validation
    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin số thẻ (cardNumber)",
      });
    }

    // Kiểm tra thẻ đã tồn tại
    const existingCard = await cardRepository.findByCardNumber(cardNumber);
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: "Số thẻ này đã tồn tại",
      });
    }

    // Chuẩn bị dữ liệu
    const cardData = {
      cardNumber: cardNumber.trim(),
      balance: balance || 0, // Mặc định số dư = 0
      status: status || "active", // Mặc định trạng thái = active
    };

    // Tạo thẻ mới
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

// ========== PUT (UPDATE) ==========

/**
 * Cập nhật thông tin thẻ
 * PUT /api/manage-cards/:id
 * Body: { cardNumber, balance, status }
 */
export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardNumber, balance, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    // Kiểm tra thẻ tồn tại
    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    // Nếu cardNumber thay đổi, kiểm tra không bị trùng
    if (cardNumber && cardNumber !== existingCard.cardNumber) {
      const duplicateCard = await cardRepository.findByCardNumber(cardNumber);
      if (duplicateCard) {
        return res.status(400).json({
          success: false,
          message: "Số thẻ này đã tồn tại",
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật (chỉ cập nhật các trường được gửi)
    const updateData = {};
    if (cardNumber !== undefined) updateData.cardNumber = cardNumber.trim();
    if (balance !== undefined) updateData.balance = balance;
    if (status !== undefined) updateData.status = status;

    // Cập nhật
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

/**
 * Nạp tiền vào thẻ (cộng vào balance)
 * PATCH /api/manage-cards/:id/recharge
 * Body: { amount }
 */
export const rechargeCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền nạp không hợp lệ",
      });
    }

    // Lấy thẻ hiện tại
    const card = await cardRepository.findById(id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    // Cộng tiền vào balance
    const newBalance = (card.balance || 0) + parseFloat(amount);

    // Cập nhật
    const updatedCard = await cardRepository.update(id, {
      balance: newBalance,
    });

    res.status(200).json({
      success: true,
      message: `Nạp tiền thành công. Số dư mới: ${newBalance}`,
      data: updatedCard,
    });
  } catch (error) {
    console.error("Lỗi khi nạp tiền thẻ:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

// ========== DELETE ==========

/**
 * Xóa một thẻ
 * DELETE /api/manage-cards/:id
 */
export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thẻ",
      });
    }

    // Kiểm tra thẻ tồn tại
    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }

    // Xóa thẻ
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

export default {
  getAllCards,
  getCardById,
  searchCardByNumber,
  createCard,
  updateCard,
  rechargeCard,
  deleteCard,
};
