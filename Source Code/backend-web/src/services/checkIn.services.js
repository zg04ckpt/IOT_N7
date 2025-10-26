import cardRepository from "../repository/cardRepository.js";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";

export const createParkingSession = async (req, res) => {
  try {
    const { licensePlate, cardId } = req.body;

    if (!licensePlate || !cardId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: licensePlate hoặc cardId",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Thiếu file ảnh",
      });
    }

    const card = await cardRepository.findById(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Thẻ không tồn tại",
      });
    }
    if (!card.isActive) {
      return res.status(400).json({
        success: false,
        message: "Thẻ không hoạt động",
      });
    }

    console.log("Card type:", card.type);

    let amountValue = 0;
    if (card.type === 1) {
      amountValue = 0;
    } else {
      amountValue = card.price;
    }

    const imageUrl = `/data/image/${req.file.filename}`;

    console.log("Amount:", amountValue);
    console.log("Image URL:", imageUrl);

    const newSessionData = {
      timeStart: new Date(),
      licensePlate,
      cardId,
      amount: amountValue,
      imageUrl: imageUrl,
      timeEnd: null,
    };

    const savedSession = await parkingSessionRepository.create(newSessionData);
    console.log("Đã lưu session:", savedSession);

    res.status(201).json({
      success: true,
      message: "Check-in thành công!",
      data: {
        id: savedSession.id,
        timeStart: savedSession.timeStart,
        licensePlate: savedSession.licensePlate,
        cardId: savedSession.cardId,
        amount: savedSession.amount,
        imageUrl: savedSession.imageUrl,
        timeEnd: savedSession.timeEnd,
        cardType: card.type === 1 ? "Vé tháng" : "Thẻ thường",
        message:
          card.type === 1
            ? `Vé tháng - Phí: ${amountValue}đ`
            : `Thẻ thường - Phí: ${amountValue}đ`,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo parking session:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default { createParkingSession };
