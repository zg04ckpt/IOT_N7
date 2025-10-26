import parkingSessionRepository from "../repository/parkingSessionRepository.js";
import deviceRepository from "../repository/deviceRepository.js";
import cardRepository from "../repository/cardRepository.js";

const viewReport = async (req, res) => {
  try {
    const allSessions = await parkingSessionRepository.findAll();
    const devices = await deviceRepository.findAll();
    const cards = await cardRepository.findAll();

    const currentVehiclesCount = allSessions.filter(
      (session) => !session.timeEnd
    ).length;

    const totalRevenueCurrentDay = calculateTotalRevenueCurrentDay(allSessions);
    const totalRevenueCurrentMonth =
      calculateTotalRevenueCurrentMonth(allSessions);

    const averageParkingDuration = calculateAverageParkingDuration(allSessions);

    const peakData = findPeakParkingPeriod(allSessions);

    const activeDevices = devices.filter((device) => device.isConnect === true);
    const totalDevices = devices.length;

    const totalMonthlyTickets = cards.filter((card) => card.type === 1).length;

    res.status(200).json({
      success: true,
      currentVehiclesCount: currentVehiclesCount,
      totalRevenueCurrentDay: totalRevenueCurrentDay,
      totalRevenueCurrentMonth: totalRevenueCurrentMonth,
      averageParkingDuration: averageParkingDuration,
      peakHour: peakData.peakHour,
      peakDay: peakData.peakDay,
      activeDevices: activeDevices.map((device) => ({
        id: device.id,
        name: device.name,
        isConnect: device.isConnect,
      })),
      totalDevices: totalDevices,
      totalMonthlyTickets: totalMonthlyTickets,
    });
  } catch (error) {
    console.error("Error viewing report:", error);
    res.status(500).json({
      success: false,
      message: "Error viewing report",
    });
  }
};

function isSameDay(dateA, dateB) {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

function calculateTotalRevenueCurrentDay(sessions) {
  const today = new Date();
  let totalRevenue = 0;

  sessions.forEach((session) => {
    if (!session.timeEnd) {
      console.log("Bỏ qua session chưa checkout:", session.id);
      return;
    }

    const endTime = new Date(session.timeEnd);
    if (isSameDay(endTime, today)) {
      const sessionAmount = Number(session.price) || 0;
      totalRevenue += sessionAmount;
      console.log(
        `+${sessionAmount}đ từ session ${session.id} (${endTime.toLocaleString(
          "vi-VN"
        )})`
      );
    }
  });

  console.log(`Tổng doanh thu hôm nay: ${totalRevenue}đ`);
  return totalRevenue;
}

function calculateTotalRevenueCurrentMonth(sessions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalRevenue = 0;

  sessions.forEach((session) => {
    if (!session.timeEnd) {
      return;
    }

    const endTime = new Date(session.timeEnd);
    const endMonth = endTime.getMonth();
    const endYear = endTime.getFullYear();

    if (endMonth === currentMonth && endYear === currentYear) {
      const sessionAmount = Number(session.price) || 0;
      totalRevenue += sessionAmount;
    }
  });

  const monthLabel = now.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
  console.log(`Tổng doanh thu tháng ${monthLabel}: ${totalRevenue}đ`);
  return totalRevenue;
}

function calculateAverageParkingDuration(sessions) {
  let totalDurationMs = 0;
  let count = 0;

  sessions.forEach((session) => {
    if (!session.timeEnd || !session.timeStart) return;

    const start = new Date(session.timeStart);
    const end = new Date(session.timeEnd);

    const duration = end - start; // milliseconds
    if (duration > 0) {
      totalDurationMs += duration;
      count++;
    }
  });

  if (count === 0) return "0h 0m";

  const avgMinutes = totalDurationMs / count / (1000 * 60);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = Math.floor(avgMinutes % 60);

  console.log(`Thời gian gửi xe trung bình: ${hours}h ${minutes}m`);

  return `${hours}h ${minutes}m`;
}

function findPeakParkingPeriod(sessions) {
  const hourCount = {};
  const dayCount = {};

  sessions.forEach((session) => {
    if (!session.timeStart) return;

    const start = new Date(session.timeStart);
    const hour = start.getHours();
    const day = start.toLocaleDateString("vi-VN");

    hourCount[hour] = (hourCount[hour] || 0) + 1;
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  if (Object.keys(hourCount).length === 0) {
    return {
      peakHour: "Không có dữ liệu",
      peakDay: "Không có dữ liệu",
    };
  }

  const peakHour = Object.keys(hourCount).reduce((a, b) =>
    hourCount[a] > hourCount[b] ? a : b
  );

  const peakDay = Object.keys(dayCount).reduce((a, b) =>
    dayCount[a] > dayCount[b] ? a : b
  );

  const nextHour = (Number(peakHour) + 1) % 24;
  const peakHourFormatted = `${peakHour}:00 - ${nextHour}:00`;

  console.log(
    `Khung giờ gửi xe nhiều nhất: ${peakHourFormatted} (${hourCount[peakHour]} lượt)`
  );
  console.log(`Ngày gửi xe nhiều nhất: ${peakDay} (${dayCount[peakDay]} lượt)`);

  return {
    peakHour: peakHourFormatted,
    peakDay: peakDay,
  };
}

export default {
  viewReport,
};
