import parkingSessionRepository from "../repository/parkingSessionRepository.js";
import cardRepository from "../repository/cardRepository.js";
import userInfoRepository from "../repository/userInfoRepository.js";

export const getListActiveVehicle = async (req, res) => {
  try {
    const { licensePlate } = req.body;

    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Biển số xe không được để trống",
      });
    }

    const vehicles = await parkingSessionRepository.findByLicensePlate(
      licensePlate
    );

    const vehiclesWithCardType = await Promise.all(
      vehicles.map(async (v) => {
        const isMonthlyCard = await isMonth(v.cardId);
        const cardInfo = await cardRepository.findById(v.cardId);

        const timeStart = new Date(v.timeStart);
        const currentTime = new Date();
        const timeElapsedMs = currentTime - timeStart;
        const timeElapsed = Math.floor(timeElapsedMs / (1000 * 60 * 60));
        const timeElapsedMinutes = Math.floor(timeElapsedMs / (1000 * 60));
        const timeElapsedSeconds = Math.floor(timeElapsedMs / 1000);

        let amountToPay = 0;
        if (!isMonthlyCard) {
          amountToPay = timeElapsed * 5000;
        }

        let monthlyTicketInfo = null;
        if (isMonthlyCard && cardInfo) {
          const allUsers = await userInfoRepository.findAll();
          const userInfo = allUsers.find((user) => user.cardId === v.cardId);

          if (userInfo) {
            const startDate = new Date(userInfo.createdAt);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            const daysRemaining = Math.ceil(
              (endDate - currentTime) / (1000 * 60 * 60 * 24)
            );

            monthlyTicketInfo = {
              name: userInfo.name,
              licensePlate: userInfo.licensePlate,
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
              daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
              isActive: daysRemaining > 0,
            };
          }
        }

        return {
          id: v.id,
          licensePlate: v.licensePlate,
          cardId: v.cardId,
          timeStart: v.timeStart,
          timeElapsed: timeElapsed,
          timeElapsedMinutes: timeElapsedMinutes,
          timeElapsedSeconds: timeElapsedSeconds,
          imageUrl: v.imageUrl
            ? `${req.protocol}://${req.get("host")}${v.imageUrl}`
            : v.imageUrl,
          cardType: cardInfo.type,
          amount: v.amount,
          amountToPay: amountToPay,
          status: v.timeEnd ? "Đã checkout" : "Đang gửi",
          monthlyTicketInfo: monthlyTicketInfo,
        };
      })
    );

    res.status(200).json({
      success: true,
      licensePlate: licensePlate,
      count: vehiclesWithCardType.length,
      data: vehiclesWithCardType.length > 0 ? vehiclesWithCardType : [],
    });
  } catch (error) {
    console.error("Error in getListActiveVehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function isMonth(cardId) {
  if (!cardId) return false;
  const card = await cardRepository.findById(cardId);
  if (!card) return false;
  if (card.type == 1) return true;
  return false;
}

const getVehicleHistory = async (req, res) => {
  try {
    const listCurrentVehicles =
      await parkingSessionRepository.getListSessionCurrent();

    const vehiclesWithFullImageUrl = listCurrentVehicles.map((vehicle) => ({
      ...vehicle,
      imageUrl: vehicle.imageUrl
        ? `${req.protocol}://${req.get("host")}${vehicle.imageUrl}`
        : vehicle.imageUrl,
    }));

    res.status(200).json({
      success: true,
      count: vehiclesWithFullImageUrl.length,
      data: vehiclesWithFullImageUrl,
    });
  } catch (error) {
    console.error("Error in getVehicleHistoryByLicensePlate:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCardHistory = async (req, res) => {
  try {
    const listHistoryVehicles =
      await parkingSessionRepository.getListSessionHistory();

    const vehiclesWithFullImageUrl = listHistoryVehicles.map((vehicle) => ({
      ...vehicle,
      imageUrl: vehicle.imageUrl
        ? `${req.protocol}://${req.get("host")}${vehicle.imageUrl}`
        : vehicle.imageUrl,
    }));

    res.status(200).json({
      success: true,
      count: vehiclesWithFullImageUrl.length,
      data: vehiclesWithFullImageUrl,
    });
  } catch (error) {
    console.error("Error in getCardHistoryByCardId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCardHistoryByCardId = async (req, res) => {
  try {
    const { licensePlate } = req.body;

    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Biển số xe không được để trống",
      });
    }

    const allHistoryVehicles =
      await parkingSessionRepository.getListSessionHistory();

    const filteredVehicles = allHistoryVehicles.filter(
      (vehicle) => vehicle.licensePlate === licensePlate
    );

    const vehiclesWithFullImageUrl = filteredVehicles.map((vehicle) => ({
      ...vehicle,
      imageUrl: vehicle.imageUrl
        ? `${req.protocol}://${req.get("host")}${vehicle.imageUrl}`
        : vehicle.imageUrl,
    }));

    if (vehiclesWithFullImageUrl.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch sử xe với biển số ${licensePlate}`,
        licensePlate: licensePlate,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử xe thành công",
      licensePlate: licensePlate,
      count: vehiclesWithFullImageUrl.length,
      data: vehiclesWithFullImageUrl,
    });
  } catch (error) {
    console.error("Error in getCardHistoryByCardId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVehicleHistoryByLicensePlate = async (req, res) => {
  try {
    const { licensePlate } = req.body;

    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Biển số xe không được để trống",
      });
    }

    const allCurrentVehicles =
      await parkingSessionRepository.getListSessionCurrent();

    const filteredVehicles = allCurrentVehicles.filter(
      (vehicle) => vehicle.licensePlate === licensePlate
    );

    const vehiclesWithFullImageUrl = filteredVehicles.map((vehicle) => ({
      ...vehicle,
      imageUrl: vehicle.imageUrl
        ? `${req.protocol}://${req.get("host")}${vehicle.imageUrl}`
        : vehicle.imageUrl,
    }));

    if (vehiclesWithFullImageUrl.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy xe đang gửi với biển số ${licensePlate}`,
        licensePlate: licensePlate,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy danh sách xe đang gửi thành công",
      licensePlate: licensePlate,
      count: vehiclesWithFullImageUrl.length,
      data: vehiclesWithFullImageUrl,
    });
  } catch (error) {
    console.error("Error in getVehicleHistoryByLicensePlate:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getListActiveVehicle,
  getVehicleHistory,
  getCardHistory,
  getCardHistoryByCardId,
  getVehicleHistoryByLicensePlate,
};
