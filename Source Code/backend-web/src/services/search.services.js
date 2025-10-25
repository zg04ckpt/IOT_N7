import parkingSessionRepository from "../repository/parkingSessionRepository.js";
import cardRepository from "../repository/cardRepository.js";

/**
 * Tìm kiếm xe đang gửi theo biển số
 * POST /api/active-vehicles
 * Body: { licensePlate: "10N-11.2345" }
 */
export const getListActiveVehicle = async (req, res) => {
    try {
        const { licensePlate } = req.body;

        if (!licensePlate) {
            return res.status(400).json({
                success: false,
                message: "Biển số xe không được để trống"
            });
        }

        console.log(`Tìm xe theo biển số: ${licensePlate}`);
        const vehicles = await parkingSessionRepository.findByLicensePlate(licensePlate);

        // Map vehicles với cardType (gọi await isMonth)
        const vehiclesWithCardType = await Promise.all(
            vehicles.map(async (v) => ({
                id: v.id,
                licensePlate: v.licensePlate,
                cardId: v.cardId,
                timeStart: v.timeStart,
                imageUrl: v.imageUrl,
                cardType: (await isMonth(v.cardId)) ? "tháng" : "thường",  //  Await
                amount: v.amount,
                status: (v.timeEnd ? "Đã checkout" : "Đang gửi"),
            }))
        );

        res.status(200).json({
            success: true,
            licensePlate: licensePlate,
            count: vehiclesWithCardType.length,
            data: vehiclesWithCardType.length > 0 ? vehiclesWithCardType : []
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
    if(card.type == 1) return true;
    return false;
}

// Export tất cả các dịch vụ tìm kiếm

const getVehicleHistory = async (req, res) => {
    try {
        const listCurrentVehicles = await parkingSessionRepository.getListSessionCurrent();
        res.status(200).json({
            success: true,
            count: listCurrentVehicles.length,
            data: listCurrentVehicles,
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
        const listHistoryVehicles = await parkingSessionRepository.getListSessionHistory();
        res.status(200).json({
            success: true,
            count: listHistoryVehicles.length,
            data: listHistoryVehicles,
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
        
        //  Validation: kiểm tra licensePlate có được gửi không
        if (!licensePlate) {
            return res.status(400).json({
                success: false,
                message: "Biển số xe không được để trống",
            });
        }

        console.log(`🔍 Tìm lịch sử xe với biển số: ${licensePlate}`);
        
        // Lấy toàn bộ lịch sử xe đã checkout
        const allHistoryVehicles = await parkingSessionRepository.getListSessionHistory();
        
        //  Filter theo licensePlate
        const filteredVehicles = allHistoryVehicles.filter(
            (vehicle) => vehicle.licensePlate === licensePlate
        );
        
        console.log(` Tìm được ${filteredVehicles.length} record(s) cho biển số ${licensePlate}`);
        
        //  Nếu không tìm thấy, báo lỗi
        if (filteredVehicles.length === 0) {
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
            count: filteredVehicles.length,
            data: filteredVehicles,
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
        
        //  Validation: kiểm tra licensePlate có được gửi không
        if (!licensePlate) {
            return res.status(400).json({
                success: false,
                message: "Biển số xe không được để trống",
            });
        }

        console.log(` Tìm xe đang gửi với biển số: ${licensePlate}`);
        
        // Lấy toàn bộ xe đang gửi (chưa checkout)
        const allCurrentVehicles = await parkingSessionRepository.getListSessionCurrent();
        
        //  Filter theo licensePlate
        const filteredVehicles = allCurrentVehicles.filter(
            (vehicle) => vehicle.licensePlate === licensePlate
        );
        
        console.log(` Tìm được ${filteredVehicles.length} xe đang gửi với biển số ${licensePlate}`);
        
        //  Nếu không tìm thấy, báo lỗi
        if (filteredVehicles.length === 0) {
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
            count: filteredVehicles.length,
            data: filteredVehicles,
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

