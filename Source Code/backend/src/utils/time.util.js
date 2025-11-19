import { DateTime } from 'luxon';


export const getDateAfferMonthsForSQL = (m) => {
    return DateTime.now()
        .setZone('Asia/Ho_Chi_Minh')
        .plus({ months: m })
        .toUTC().toSQL({ includeOffset: false });
}