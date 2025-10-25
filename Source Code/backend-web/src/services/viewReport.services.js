
    // Đây là chức năng được thực hiện khi quản lý hoặc chủ bãi đỗ xe muốn xem thông tin báo cáo thống kê về bãi đỗ xe hiện tại. Cụ thể các bước như sau:
    // 	Quản lý đăng nhập vào hệ thống (Website)
    // 	Hệ thống hiển thị giao diện chứa các dữ liệu thống kê bao gồm: 
    // o	Tổng số phương tiện hiện tại
    // o	Tổng doanh thu trong ngày, theo tháng
    // o	Thời gian gửi xe trung bình
    // o	Khoảng thời gian gửi xe nhiều nhất theo giờ, theo ngày
    // o	Danh sách thiết bị đang hoạt động
    // o	Tổng số vé tháng

import e from "express";
import parkingSessionRepository from "../repository/parkingSessionRepository.js";
import deviceRepository from "../repository/deviceRepository.js";
import cardRepository from "../repository/cardRepository.js";

const viewReport = async (req, res) => {
    try {
        // Lấy thông tin báo cáo từ cơ sở dữ liệu
        const currentVehiclesCount = await parkingSessionRepository.findAll();
        const totalRevenueCurrentDay = calculateTotalRevenueCurrentDay(currentVehiclesCount);
        const totalRevenueCurrentMonth = calculateTotalRevenueCurrentMonth(currentVehiclesCount);
        const averageParkingDuration = calculateAverageParkingDuration(currentVehiclesCount);
        const peakParkingPeriod = findPeakParkingPeriod(currentVehiclesCount);
        const devices = await deviceRepository.findAll();
        const cards = await cardRepository.findAll();

        let totalCardMonthly = 0;
        for (const card of cards) {
            if (card.type === 1) { // type 1 = vé tháng
                totalCardMonthly++;
            }
        }

        // Trả về dữ liệu báo cáo
        res.status(200).json({
            success: true,
            currentVehiclesCount: currentVehiclesCount.length,
            totalRevenueCurrentDay: totalRevenueCurrentDay,
            totalRevenueCurrentMonth: totalRevenueCurrentMonth,
            averageParkingDuration: averageParkingDuration,
            peakParkingPeriod: peakParkingPeriod,
            totalSessions: currentVehiclesCount.length,
            devices: devices.map(device => device.name),
            cardMonthlyCount: totalCardMonthly
        });
    } catch (error) {
        console.error("Error viewing report:", error);
        res.status(500).json({
            success: false,
            message: "Error viewing report"
        });
    }
};
/**
 * Chuẩn hóa: kiểm tra xem 2 mốc thời gian có cùng ngày/tháng/năm không
 */
function isSameDay(dateA, dateB) {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

/**
 * Tính tổng doanh thu trong NGÀY hiện tại
 * Chỉ tính các session đã checkout (có timeEnd)
 */
function calculateTotalRevenueCurrentDay(sessions) {
  const today = new Date();
  let totalRevenue = 0;

  sessions.forEach(session => {
    if (!session.timeEnd ) {
      console.log('Bỏ qua session chưa checkout:', session.id);
      return;
    }

    const endTime = new Date(session.timeEnd);
    if (isSameDay(endTime, today)) {
      const sessionAmount = Number(session.price) || 0;
      totalRevenue += sessionAmount;
      console.log(`+${sessionAmount}đ từ session ${session.id} (${endTime.toLocaleString('vi-VN')})`);
    }
  });

  console.log(`Tổng doanh thu hôm nay: ${totalRevenue}đ`);
  return totalRevenue;
}

/**
 * Tính tổng doanh thu trong THÁNG hiện tại
 * Chỉ tính các session đã checkout (có timeEnd)
 */
function calculateTotalRevenueCurrentMonth(sessions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalRevenue = 0;

  sessions.forEach(session => {
    if (!session.timeEnd) {
      return;
    }

    const endTime = new Date(session.timeEnd);
    const endMonth = endTime.getMonth();
    const endYear = endTime.getFullYear();

    if (endMonth === currentMonth && endYear === currentYear) {
      const sessionAmount = Number(session.price) || 0;
      totalRevenue += sessionAmount;
      console.log(`+${sessionAmount}đ từ session ${session.id} (${endTime.toLocaleString('vi-VN')})`);
    }
  });

  const monthLabel = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  console.log(`Tổng doanh thu tháng ${monthLabel}: ${totalRevenue}đ`);
  return totalRevenue;
}

/**
 * Tính thời gian gửi xe trung bình (tính bằng phút)
 * - Chỉ tính các session đã checkout (có timeEnd)
 * - Cho phép khác ngày (dựa trên chênh lệch timeEnd - timeStart)
 */
function calculateAverageParkingDuration(sessions) {
  let totalDurationMs = 0;
  let count = 0;

  sessions.forEach(session => {
    if (!session.timeEnd || !session.timeStart) return;

    const start = new Date(session.timeStart);
    const end = new Date(session.timeEnd);

    const duration = end - start; // milliseconds
    if (duration > 0) {
      totalDurationMs += duration;
      count++;
    }
  });

  if (count === 0) return 0;

  const avgMinutes = totalDurationMs / count / (1000 * 60);
  console.log(`Thời gian gửi xe trung bình: ${avgMinutes.toFixed(2)} phút`);

  return avgMinutes.toFixed(2);
}

/**
 * Thống kê khoảng thời gian gửi xe nhiều nhất (peak time)
 * - Dựa theo timeStart
 * - Trả về: khung giờ có nhiều lượt gửi nhất, và số lượng
 */
function findPeakParkingPeriod(sessions) {
  const hourCount = {};
  const dayCount = {};

  sessions.forEach(session => {
    if (!session.timeStart) return;

    const start = new Date(session.timeStart);
    const hour = start.getHours(); // 0-23
    const day = start.toLocaleDateString('vi-VN'); // e.g. "23/10/2025"

    // Đếm theo giờ
    hourCount[hour] = (hourCount[hour] || 0) + 1;

    // Đếm theo ngày
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  // Tìm khung giờ có nhiều lượt nhất
  const peakHour = Object.keys(hourCount).reduce((a, b) =>
    hourCount[a] > hourCount[b] ? a : b
  );

  // Tìm ngày có nhiều lượt nhất
  const peakDay = Object.keys(dayCount).reduce((a, b) =>
    dayCount[a] > dayCount[b] ? a : b
  );

  console.log(`Khung giờ gửi xe nhiều nhất: ${peakHour}:00 (${hourCount[peakHour]} lượt)`);
  console.log(`Ngày gửi xe nhiều nhất: ${peakDay} (${dayCount[peakDay]} lượt)`);

  return {
    peakHour: Number(peakHour),
    peakHourCount: hourCount[peakHour],
    peakDay,
    peakDayCount: dayCount[peakDay]
  };
}

export default {
    viewReport
};