import parkingSessionRepository from "../repository/parkingSessionRepository.js";

/**
 * Hàm checkout (check-out) parking session
 * - Cập nhật timeEnd = thời gian hiện tại
 * - Giữ nguyên timeStart và các thông tin khác
 * - Sử dụng repository.update() để cập nhật
 */
export const checkOutParkingSession = async (req, res) => {
  try {
    // 1. Lấy ID của parking session từ URL params
    const { id } = req.params;

    // 2. Kiểm tra dữ liệu đầu vào
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin ID của parking session',
      });
    }

    // 3. Lấy parking session hiện tại từ DB để kiểm tra tồn tại
    const currentSession = await parkingSessionRepository.findById(id);
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        message: 'Parking session không tồn tại',
      });
    }

    // 4. Chuẩn bị dữ liệu cập nhật
    // Chỉ cập nhật timeEnd = thời gian hiện tại
    // Giữ nguyên timeStart và các thông tin khác
    const updateData = {
      timeEnd: new Date(), // Thời gian check-out = hiện tại
      // Các trường khác (timeStart, licensePlate, cardId, imageUrl, amount) giữ nguyên
    };

    // 5. Gọi repository.update() để cập nhật vào DB
    const updatedSession = await parkingSessionRepository.update(id, updateData);

    // 6. Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: 'Checkout parking session thành công!',
      data: updatedSession,
    });

  } catch (error) {
    console.error('Lỗi khi checkout parking session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ nội bộ',
    });
  }
};

export default {
  checkOutParkingSession,
};
