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

        console.log(`🔍 Tìm xe theo biển số: ${licensePlate}`);
        const vehicles = await parkingSessionRepository.findByLicensePlate(licensePlate);


        // ✅ SỮA: Map vehicles với cardType (gọi await isMonth)
        const vehiclesWithCardType = await Promise.all(
            vehicles.map(async (v) => ({
                id: v.id,
                licensePlate: v.licensePlate,
                cardId: v.cardId,
                timeStart: v.timeStart,
                imageUrl: v.imageUrl,
                cardType: (await isMonth(v.cardId)) ? "tháng" : "thường",  // ✅ Await
                amount: v.amount,
                status: "đang gửi"
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

export default {
    getListActiveVehicle,
};