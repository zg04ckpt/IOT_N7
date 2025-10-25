'use strict';

export async function up(queryInterface, Sequelize) {
  try {
    // Kiểm tra xem cột price đã tồn tại chưa
    const tableDescription = await queryInterface.describeTable('parking_sessions');
    
    if (!tableDescription.price) {
      await queryInterface.addColumn('parking_sessions', 'price', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Giá tiền tính theo phút hoặc giờ'
      });
      console.log('✅ Thêm cột price vào bảng parking_sessions');
    } else {
      console.log('⚠️  Cột price đã tồn tại trong bảng parking_sessions');
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm cột price vào parking_sessions:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    const tableDescription = await queryInterface.describeTable('parking_sessions');
    
    if (tableDescription.price) {
      await queryInterface.removeColumn('parking_sessions', 'price');
      console.log('✅ Xóa cột price khỏi bảng parking_sessions');
    }
  } catch (error) {
    console.error('❌ Lỗi khi xóa cột price từ parking_sessions:', error);
    throw error;
  }
}
