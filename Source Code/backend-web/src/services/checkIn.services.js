import cardRepository from "../repository/cardRepository.js";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";

/**
 * CHECK-IN: Tạo phiên đỗ xe mới
 */
export const createParkingSession = async (req, res) => {
  try {
    // 1. Lấy các trường từ request body
    const { licensePlate, cardId } = req.body;

    // 2. Validation input
    if (!licensePlate || !cardId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: licensePlate hoặc cardId',
      });
    }

    //  3. Kiểm tra file ảnh
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu file ảnh',
      });
    }

    // 4. Lấy thông tin card từ DB
    const card = await cardRepository.findById(cardId);

    // 5. Kiểm tra card tồn tại
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Thẻ không tồn tại',
      });
    }
    if(!card.isActive){
      return res.status(400).json({
        success: false,
        message: 'Thẻ không hoạt động',
      });
    }

    console.log('Card type:', card.type);

    // 6. Xác định amount dựa trên card.type
    let amountValue = 0;
    if (card.type === 1) {
      amountValue = 0;  // Vé tháng
    } else {
      amountValue = card.price;  // Thẻ thường
    }

    //  7. Tạo URL ảnh từ file được upload
    const imageUrl = `/data/image/${req.file.filename}`;

    console.log('Amount:', amountValue);
    console.log('Image URL:', imageUrl);

    // 8. Tạo đối tượng session mới
    const newSessionData = {
      timeStart: new Date(),
      licensePlate,
      cardId,
      amount: amountValue,
      imageUrl: imageUrl,
      timeEnd: null,
    };

    // 9. Lưu vào DB
    const savedSession = await parkingSessionRepository.create(newSessionData);
    console.log('Đã lưu session:', savedSession);

    // 10. Trả về kết quả
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
            ? `Vé tháng - Phí: ${amountValue}đ`
            : `Thẻ thường - Phí: ${amountValue}đ`,
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
