import userInfoRepository from "../repository/userInfoRepository.js";
import cardRepository from "../repository/cardRepository.js";

export const registerMonthlyCard = async (req, res) => {
  try {
    const { name, phoneNumber, cardId, licensePlate, price } = req.body;

    if (!name || !phoneNumber || !cardId || !licensePlate) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc: name, phoneNumber, cardId, licensePlatel",
      });
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không hợp lệ (phải là 10-11 chữ số)",
      });
    }

    const card = await cardRepository.findById(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    } else if (card.type === 1 && card.isActive) {
      return res.status(400).json({
        success: false,
        message: "Thẻ đã được đăng kí vé tháng và đang hoạt động",
      });
    }

    const checkExistingUser = await userInfoRepository.findByLicensePlate(
      licensePlate
    );
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "Biển số xe đã được đăng kí vé tháng",
      });
    }

    const userInfoData = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      cardId: parseInt(cardId, 10),
      licensePlate: licensePlate.trim(),
    };

    const newUserInfo = await userInfoRepository.create(userInfoData);

    const cardUpdateData = {
      type: 1,
      isActive: true,
    };

    if (price !== undefined && price !== null) {
      cardUpdateData.price = parseInt(price, 10);
      console.log(" Price convert:", cardUpdateData.price);
    }

    console.log(" Card update data:", cardUpdateData);

    const updatedCard = await cardRepository.update(cardId, cardUpdateData);

    res.status(201).json({
      success: true,
      message: "Đăng kí vé tháng thành công",
      data: {
        userInfo: {
          id: newUserInfo.id,
          name: newUserInfo.name,
          phoneNumber: newUserInfo.phoneNumber,
          licensePlate: newUserInfo.licensePlate,
          cardId: newUserInfo.cardId,
          createdAt: newUserInfo.createdAt,
          updatedAt: newUserInfo.updatedAt,
        },
        card: {
          id: updatedCard.id,
          type: updatedCard.type,
          isActive: updatedCard.isActive,
          message: "Thẻ đã được cập nhật thành vé tháng (type=1)",
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng kí vé tháng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const getMonthlyCardUsers = async (req, res) => {
  try {
    const users = await userInfoRepository.findAll();

    const monthlyCardUsers = users.filter((user) => {
      return user.cardId !== null && user.cardId !== undefined;
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người gửi xe vé tháng thành công",
      data: monthlyCardUsers,
      total: monthlyCardUsers.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vé tháng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const getMonthlyCardUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin User ID",
      });
    }

    const userInfo = await userInfoRepository.findById(userId);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người gửi xe",
      });
    }

    const card = await cardRepository.findById(userInfo.cardId);

    res.status(200).json({
      success: true,
      message: "Lấy thông tin vé tháng thành công",
      data: {
        userInfo: userInfo,
        card: card,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin vé tháng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const updateMonthlyCardUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, licensePlate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin User ID",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phoneNumber !== undefined) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không hợp lệ (phải là 10-11 chữ số)",
        });
      }
      updateData.phoneNumber = phoneNumber.trim();
    }
    if (licensePlate !== undefined)
      updateData.licensePlate = licensePlate.trim();

    const updatedUser = await userInfoRepository.update(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin vé tháng thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin vé tháng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const cancelMonthlyCard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin User ID",
      });
    }

    const existingUser = await userInfoRepository.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người gửi xe",
      });
    }

    const cardId = existingUser.cardId;

    await userInfoRepository.delete(userId);

    if (cardId) {
      await cardRepository.update(cardId, {
        type: 0,
        isActive: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Hủy vé tháng thành công",
      data: {
        userId,
        cardId,
        message: "Thẻ đã được reset và vô hiệu hóa",
      },
    });
  } catch (error) {
    console.error("Lỗi khi hủy vé tháng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  registerMonthlyCard,
  getMonthlyCardUsers,
  getMonthlyCardUserById,
  updateMonthlyCardUser,
  cancelMonthlyCard,
};
