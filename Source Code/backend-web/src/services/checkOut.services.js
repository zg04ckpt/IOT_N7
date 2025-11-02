import parkingSessionRepository from "../repository/parkingSessionRepository.js";

export const checkOutParkingSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID của parking session",
      });
    }

    const currentSession = await parkingSessionRepository.findById(id);
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        message: "Parking session không tồn tại",
      });
    }

    const timeStart = new Date(currentSession.timeStart);
    const timeEnd = new Date();

    const amountValue = parseInt(currentSession.amount, 10);

    const timeDiffMs = timeEnd - timeStart;

    const daysPassed = Math.ceil(timeDiffMs / (24 * 60 * 60 * 1000));

    console.log(`Thời gian bắt đầu: ${timeStart}`);
    console.log(`Thời gian kết thúc: ${timeEnd}`);
    console.log(`Số ngày qua: ${daysPassed}`);
    console.log(`Amount gốc (type: ${typeof amountValue}): ${amountValue}`);

    let calculatedPrice = 0;
    if (daysPassed <= 1) {
      calculatedPrice = amountValue;
    } else {
      const extraDays = daysPassed - 1;
      calculatedPrice = amountValue + amountValue * 2 * extraDays;
    }

    console.log(
      ` Price tính toán: ${calculatedPrice} (type: ${typeof calculatedPrice})`
    );

    const updateData = {
      timeEnd: timeEnd,
      price: calculatedPrice,
    };

    console.log(`Update data:`, updateData);

    const updatedSession = await parkingSessionRepository.update(
      id,
      updateData
    );

    console.log(`Session ${id} đã được checkout:`, updatedSession);

    res.status(200).json({
      success: true,
      message: "Checkout parking session thành công!",
      data: {
        id: updatedSession.id,
        timeStart: updatedSession.timeStart,
        timeEnd: updatedSession.timeEnd,
        licensePlate: updatedSession.licensePlate,
        cardId: updatedSession.cardId,
        amount: amountValue,
        daysPassed: daysPassed,
        price: calculatedPrice,
        priceCalculation:
          daysPassed <= 1
            ? `${amountValue}đ (< 1 ngày)`
            : `${amountValue} + ${amountValue} * 2 * ${
                daysPassed - 1
              } = ${calculatedPrice}đ`,
        message: `Xe ${updatedSession.licensePlate} đã checkout. Tổng tiền: ${calculatedPrice}đ (${daysPassed} ngày)`,
      },
    });
  } catch (error) {
    console.error("Lỗi khi checkout parking session:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  checkOutParkingSession,
};
