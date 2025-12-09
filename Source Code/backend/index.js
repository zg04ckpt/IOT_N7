import dotenv from 'dotenv'
import app from './src/app.js'
import { setupFirmwareEnvironment } from './src/utils/firmware-setup.js'

dotenv.config()

const PORT = process.env.PORT;

// Thiết lập môi trường firmware trước khi start server
setupFirmwareEnvironment()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 LAN access: http://0.0.0.0:${PORT}`);
      console.log(`💻 Local access: http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to setup firmware environment:', error);
    process.exit(1);
  });

