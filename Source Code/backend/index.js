import dotenv from 'dotenv'
import app from './src/app.js'
import { setupFirmwareEnvironment } from './src/utils/firmware-setup.js'

dotenv.config()

const PORT = process.env.PORT;

// Thiết lập môi trường firmware trước khi start server
setupFirmwareEnvironment()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to setup firmware environment:', error);
    process.exit(1);
  });

