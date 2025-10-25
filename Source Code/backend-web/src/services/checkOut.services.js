import parkingSessionRepository from "../repository/parkingSessionRepository.js";

/**
 * Hàm checkout (check-out) parking session
 * - Cập nhật timeEnd = thời gian hiện tại
 * - Tính price dựa trên số ngày: price = amount + amount * (số ngày - 1) * 2
 * - Nếu < 1 ngày: price = amount
 * - Nếu >= 1 ngày: price = amount + amount * 2 * (số ngày - 1)
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

    //  4. Tính tiền dựa trên số ngày
    const timeStart = new Date(currentSession.timeStart);
    const timeEnd = new Date(); // Thời gian check-out = hiện tại
    
    //  Convert amount sang number (vì có thể là string từ DB)
    const amountValue = parseInt(currentSession.amount, 10);
    
    // Tính số mili giây giữa start và end
    const timeDiffMs = timeEnd - timeStart;
    
    // Tính số ngày (24 giờ = 86400000 ms)
    const daysPassed = Math.ceil(timeDiffMs / (24 * 60 * 60 * 1000));
    
    console.log(`⏱️  Thời gian bắt đầu: ${timeStart}`);
    console.log(`⏱️  Thời gian kết thúc: ${timeEnd}`);
    console.log(`📊 Số ngày qua: ${daysPassed}`);
    console.log(`💰 Amount gốc (type: ${typeof amountValue}): ${amountValue}`);

    //  Công thức tính giá:
    // - Nếu < 1 ngày: price = amount
    // - Nếu >= 1 ngày: price = amount + amount * 2 * (số ngày - 1)
    let calculatedPrice = 0;
    if (daysPassed <= 1) {
      // Chưa đủ 1 ngày
      calculatedPrice = amountValue;
    } else {
      // Đã qua >= 1 ngày
      // price = amount (giá cơ bản) + amount * 2 * (ngày thêm)
      const extraDays = daysPassed - 1;
      calculatedPrice = amountValue + (amountValue * 2 * extraDays);
    }

    console.log(` Price tính toán: ${calculatedPrice} (type: ${typeof calculatedPrice})`);

    // 5. Chuẩn bị dữ liệu cập nhật
    const updateData = {
      timeEnd: timeEnd,      // Thời gian check-out = hiện tại
      price: calculatedPrice, //  Cập nhật giá dựa trên số ngày
      // Các trường khác (timeStart, licensePlate, cardId, imageUrl, amount) giữ nguyên
    };

    console.log(`📝 Update data:`, updateData);

    // 6. Gọi repository.update() để cập nhật vào DB
    const updatedSession = await parkingSessionRepository.update(id, updateData);

    console.log(` Session ${id} đã được checkout:`, updatedSession);

    // 7. Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: 'Checkout parking session thành công!',
      data: {
        id: updatedSession.id,
        timeStart: updatedSession.timeStart,
        timeEnd: updatedSession.timeEnd,
        licensePlate: updatedSession.licensePlate,
        cardId: updatedSession.cardId,
        amount: amountValue,
        daysPassed: daysPassed,
        price: calculatedPrice,
        priceCalculation: daysPassed <= 1 
          ? `${amountValue}đ (< 1 ngày)` 
          : `${amountValue} + ${amountValue} * 2 * ${daysPassed - 1} = ${calculatedPrice}đ`,
        message: `Xe ${updatedSession.licensePlate} đã checkout. Tổng tiền: ${calculatedPrice}đ (${daysPassed} ngày)`,
      },
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
