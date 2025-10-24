import cardRepository from "../repository/cardRepository.js";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";

/**
 * CHECK-IN: Tạo phiên đỗ xe mới
 */
export const createParkingSession = async (req, res) => {
  try {
    // 1. Lấy các trường từ request body
    const {timeStart,licensePlate, cardId, imageUrl,amount } = req.body;

    // 2. Validation input
    if (!licensePlate || !cardId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: licensePlate hoặc cardId',
      });
    }

    // 3. Lấy thông tin card từ DB
    const card = await cardRepository.findById(cardId);

    // 4. Kiểm tra card tồn tại
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Thẻ không tồn tại',
      });
    }

    console.log('Card type:', card.type);

    // 5. Xác định amount dựa trên card.type
    let amountValue = amount;
    if (card.type == 1) {
      amountValue = 0;  // Vé tháng
    } else {
      amountValue = 5000;     // Thẻ thường
    }

    console.log('Amount:', amount);

    // 6. Tạo đối tượng session mới
    const newSessionData = {
      timeStart:  new Date(),
      licensePlate,
      cardId,
      amount: amountValue,
      imageUrl: imageUrl || null,
      timeEnd: null,
    };

    // 7. Lưu vào DB
    const savedSession = await parkingSessionRepository.create(newSessionData);
    console.log('Đã lưu session:', savedSession);

    // 8. Trả về kết quả
    res.status(201).json({
      success: true,
      message: 'Check-in thành công!',
      data: {
        id: savedSession.id,
        timeStart: savedSession.timeStart,
        licensePlate: savedSession.licensePlate,
        cardId: savedSession.cardId,
        amount: savedSession.amount,
        imageUrl: savedSession.imageUrl,
        timeEnd: savedSession.timeEnd,
        cardType: card.type === 1 ? 'Vé tháng' : 'Thẻ thường',
        message:
          card.type === 1
            ? `Vé tháng - Phí: ${amount}đ`
            : `Thẻ thường - Phí: ${amount}đ`,
      },
    });
  } catch (error) {
    console.error('Lỗi khi tạo parking session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ nội bộ',
    });
  }
};

export default { createParkingSession };
