import userInfoRepository from "../repository/userInfoRepository.js";
import cardRepository from "../repository/cardRepository.js";

/**
 * ĐĂNG KÝ VÉ THÁNG
 * Quy trình:
 * 1. Nhân viên nhập thông tin khách hàng (name, phoneNumber, licensePlate)
 * 2. Khách hàng quét thẻ (cardId được gửi từ device)
 * 3. Hệ thống tạo UserInfo mới và cập nhật Card với type = 1 (vé tháng)
 * 4. Trả về thông tin đã đăng kí thành công
 */

/**
 * Đăng kí vé tháng cho người gửi xe
 * POST /api/register-monthly-card
 * Body: { name, phoneNumber, cardId, licensePlate }
 *
 * Quy trình:
 * - Tạo UserInfo mới (lưu: name, phoneNumber, cardId, licensePlate)
 * - Cập nhật Card với type = 1 (vé tháng)
 * - Trả về thông tin đã đăng kí
 */
export const registerMonthlyCard = async (req, res) => {
  try {
    const { name, phoneNumber, cardId, licensePlate, price } = req.body;

    // ========== VALIDATION ==========
    if (!name || !phoneNumber || !cardId || !licensePlate ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: name, phoneNumber, cardId, licensePlatel",
      });
    }

    // Kiểm tra phoneNumber có hợp lệ không
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không hợp lệ (phải là 10-11 chữ số)",
      });
    }

    // ========== KIỂM TRA CARD TỒN TẠI ==========
    const card = await cardRepository.findById(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }else if (card.type === 1 && card.isActive) {
      return res.status(400).json({
        success: false,
        message: "Thẻ đã được đăng kí vé tháng và đang hoạt động",
      });
    }

    const checkExistingUser = await userInfoRepository.findByLicensePlate(licensePlate);
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "Biển số xe đã được đăng kí vé tháng",
      });
    }

    // ========== TẠO USER INFO MỚI ==========
    // Lưu thông tin người gửi xe kèm theo cardId
    const userInfoData = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      cardId: parseInt(cardId, 10),
      licensePlate: licensePlate.trim(),
      // createdAt và updatedAt sẽ tự động được Sequelize gán
    };

    const newUserInfo = await userInfoRepository.create(userInfoData);

    // ========== CẬP NHẬT CARD THÀNH VÉ THÁNG ==========
    // type = 1 ứng với vé tháng
    const cardUpdateData = {
      type: 1, // 1 = vé tháng
      isActive: true, // Kích hoạt thẻ
    };
  
    //  Nếu có price, convert sang số
    if (price !== undefined && price !== null) {
      cardUpdateData.price = parseInt(price, 10);
      console.log(' Price convert:', cardUpdateData.price);
    }
    
    console.log(' Card update data:', cardUpdateData);
    
    const updatedCard = await cardRepository.update(cardId, cardUpdateData);

    // ========== TRẢ VỀ KẾT QUẢ THÀNH CÔNG ==========
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

/**
 * Lấy danh sách người gửi xe (UserInfo) có vé tháng
 * GET /api/monthly-cards/users
 */
export const getMonthlyCardUsers = async (req, res) => {
  try {
    // Lấy tất cả UserInfo
    const users = await userInfoRepository.findAll();

    // Lọc chỉ lấy những user có card với type = 1 (vé tháng)
    // Trong thực tế nên filter ở database query để hiệu quả hơn
    const monthlyCardUsers = users.filter((user) => {
      // Giả sử card object có property type
      // Nếu cần filter chính xác, nên update repository method
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

/**
 * Lấy thông tin đăng kí vé tháng theo UserInfo ID
 * GET /api/monthly-cards/users/:userId
 */
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

    // Lấy thông tin card đi kèm
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

/**
 * Cập nhật thông tin người gửi xe vé tháng
 * PUT /api/monthly-cards/users/:userId
 * Body: { name, phoneNumber, licensePlate }
 */
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

    // Kiểm tra UserInfo tồn tại
    // const existingUser = await userInfoRepository.findById(userId);
    // if (!existingUser) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Không tìm thấy thông tin người gửi xe",
    //   });
    // }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phoneNumber !== undefined) {
      // Validate phoneNumber
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không hợp lệ (phải là 10-11 chữ số)",
        });
      }
      updateData.phoneNumber = phoneNumber.trim();
    }
    if (licensePlate !== undefined) updateData.licensePlate = licensePlate.trim();

    // Cập nhật
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

/**
 * Hủy vé tháng (xóa UserInfo)
 * DELETE /api/monthly-cards/users/:userId
 * 
 * Lưu ý: Xóa UserInfo, nhưng có thể giữ lại Card cho việc tái sử dụng
 */
export const cancelMonthlyCard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin User ID",
      });
    }

    // Kiểm tra UserInfo tồn tại
    const existingUser = await userInfoRepository.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người gửi xe",
      });
    }

    // Lưu cardId trước khi xóa (để update lại)
    const cardId = existingUser.cardId;

    // Xóa UserInfo
    await userInfoRepository.delete(userId);

    // (Tuỳ chọn) Cập nhật lại Card: reset type về 0, vô hiệu hóa
    if (cardId) {
      await cardRepository.update(cardId, {
        type: 0, // Reset type thành thẻ thường
        isActive: false, // Vô hiệu hóa thẻ
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
