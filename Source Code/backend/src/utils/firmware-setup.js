import { ensureArduinoCli, installBoardCore } from './device.util.js';
import db from '../config/database.js';

/**
 * Thiết lập môi trường firmware (tải tools, cài đặt boards)
 */
export async function setupFirmwareEnvironment() {
  console.log('\n━━━ FIRMWARE ENVIRONMENT SETUP ━━━');
  
  try {
    // 1. Tải Arduino CLI
    await ensureArduinoCli();
    
    // 2. Quét boards từ database
    console.log('\nQuét boards từ database...');
    const [devices] = await db.execute('SELECT DISTINCT board FROM devices');
    
    if (devices.length === 0) {
      console.log('Không có thiết bị nào trong database, bỏ qua cài đặt board cores.');
    } else {
      console.log(`Tìm thấy ${devices.length} board type(s): ${devices.map(d => d.board).join(', ')}`);
      
      // Cài đặt board cores từ database
      for (const device of devices) {
        await installBoardCore(device.board);
      }
    }
    
    console.log('\n✓ Firmware environment sẵn sàng!\n');
  } catch (error) {
    console.error('\n✗ Lỗi khi thiết lập firmware environment:', error.message);
    throw error;
  }
}
