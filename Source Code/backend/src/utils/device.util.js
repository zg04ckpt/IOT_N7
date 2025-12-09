import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR = path.resolve('tools', 'firmware_compiler');
const ARDUINO_CLI_DIR = path.join(TOOLS_DIR, 'arduino-cli');

// Lấy đường dẫn arduino-cli binary
function getArduinoCliBinaryPath() {
  const platform = os.platform();
  
  // Trong Docker/Linux, kiểm tra system-installed arduino-cli trước
  if (platform === 'linux') {
    try {
      execSync('which arduino-cli', { stdio: 'pipe' });
      return 'arduino-cli'; // Sử dụng từ system PATH
    } catch (e) {
      // Nếu không có trong PATH, tìm trong thư mục local
      const localPath = path.join(ARDUINO_CLI_DIR, 'arduino-cli');
      if (fsSync.existsSync(localPath)) return localPath;
      throw new Error('arduino-cli chưa được cài đặt');
    }
  }
  
  // Windows
  if (platform === 'win32') {
    const inDir = path.join(ARDUINO_CLI_DIR, 'arduino-cli.exe');
    if (fsSync.existsSync(inDir)) return inDir;

    const outside = path.join(TOOLS_DIR, 'arduino-cli.exe');
    if (fsSync.existsSync(outside)) return outside;

    throw new Error('arduino-cli chưa được cài đặt');
  }
  
  // MacOS
  return path.join(ARDUINO_CLI_DIR, 'arduino-cli');
}

/**
 * Tải arduino-cli nếu chưa có
 */
export async function ensureArduinoCli() {
  let ARDUINO_CLI_BIN;
  try {
    ARDUINO_CLI_BIN = getArduinoCliBinaryPath();
    console.log('✓ arduino-cli đã sẵn sàng');
    return ARDUINO_CLI_BIN;
  } catch (e) {
    console.log('Đang tải arduino-cli...');
  }

  await fs.mkdir(TOOLS_DIR, { recursive: true });

  const version = '0.35.3';
  const url = {
    win32: `https://downloads.arduino.cc/arduino-cli/arduino-cli_${version}_Windows_64bit.zip`,
    darwin: `https://downloads.arduino.cc/arduino-cli/arduino-cli_${version}_macOS_64bit.tar.gz`,
    linux: `https://downloads.arduino.cc/arduino-cli/arduino-cli_${version}_Linux_64bit.tar.gz`,
  }[os.platform()];

  const archivePath = path.join(TOOLS_DIR, 'arduino-cli-temp.' + (url.endsWith('.zip') ? 'zip' : 'tar.gz'));
  await downloadFile(url, archivePath);

  if (url.endsWith('.zip')) {
    execSync(`powershell -command "Expand-Archive -Force '${archivePath}' '${TOOLS_DIR}'"`, { stdio: 'ignore' });
  } else {
    execSync(`tar -xzf "${archivePath}" -C "${TOOLS_DIR}"`, { stdio: 'ignore' });
  }

  await fs.unlink(archivePath);
  
  const binaryPath = getArduinoCliBinaryPath();
  await fs.chmod(binaryPath, 0o755);
  
  console.log('✓ arduino-cli đã tải xong');
  return binaryPath;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fsSync.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fsSync.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Cài đặt board core
 */
export async function installBoardCore(board) {
  const ARDUINO_CLI_BIN = getArduinoCliBinaryPath();
  const core = board.split(':').slice(0, 2).join(':');

  try {
    console.log(`Cài đặt core: ${core}...`);
    execSync(`"${ARDUINO_CLI_BIN}" core update-index`, { stdio: 'ignore' });
    execSync(`"${ARDUINO_CLI_BIN}" core install ${core}`, { stdio: 'ignore' });
    console.log(`✓ Core ${core} đã sẵn sàng`);
  } catch (e) {
    console.log(`Core ${core} đã được cài đặt`);
  }
}

/**
 * Phát hiện và cài đặt thư viện từ source code
 * @param {string} sourceCode - Mã nguồn .ino
 */
async function installLibrariesFromSource(sourceCode) {
  const ARDUINO_CLI_BIN = getArduinoCliBinaryPath();
  
  // Tìm tất cả các #include trong source code
  const includeRegex = /#include\s*[<"]([^>"]+)[>"]/g;
  const matches = [...sourceCode.matchAll(includeRegex)];
  
  if (matches.length === 0) {
    console.log('Không tìm thấy thư viện nào trong source code');
    return;
  }

  const libraries = matches.map(m => m[1].replace('.h', ''));
  
  // Bỏ qua các thư viện chuẩn của Arduino và ESP32
  const standardLibs = [
    // Arduino standard libraries
    'Arduino', 'Wire', 'SPI', 'EEPROM', 'SD', 
    'Servo', 'LiquidCrystal', 'Stepper', 'SoftwareSerial',
    // ESP32 built-in libraries
    'WiFi', 'WiFiClient', 'WiFiServer', 'WiFiUdp',
    'HTTPClient', 'WebServer', 'ESPmDNS',
    'Update', 'ESP', 'SPIFFS', 'FS', 'Preferences',
    'BluetoothSerial', 'BLE', 'ESPAsyncWebServer'
  ];
  
  const customLibs = libraries.filter(lib => !standardLibs.includes(lib));
  
  if (customLibs.length === 0) {
    console.log('Chỉ sử dụng thư viện chuẩn, không cần cài đặt thêm');
    return;
  }

  console.log(`Phát hiện ${customLibs.length} thư viện: ${customLibs.join(', ')}`);

  // Cập nhật index trước
  try {
    console.log('Đang cập nhật library index...');
    execSync(`"${ARDUINO_CLI_BIN}" lib update-index`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Không thể cập nhật library index:', e.message);
  }

  // Cài đặt từng thư viện
  for (const lib of customLibs) {
    try {
      console.log(`\nĐang cài đặt thư viện: ${lib}...`);
      execSync(`"${ARDUINO_CLI_BIN}" lib install "${lib}"`, { stdio: 'inherit', timeout: 300000 });
      console.log(`✓ Đã cài đặt: ${lib}`);
    } catch (e) {
      console.warn(`⚠ Không thể cài đặt thư viện "${lib}": ${e.message}`);
      // Không throw error, tiếp tục với các thư viện khác
    }
  }
}

/**
 * Build firmware từ source code
 * @param {string} sourceCode - Mã nguồn .ino
 * @param {string} deviceName - Tên thiết bị
 * @param {string} board - Board type (fqbn)
 * @param {number} currentVersion - Version hiện tại
 * @returns {Promise<{version: string, binPath: string}>}
 */
export async function buildFirmware(sourceCode, deviceName, board, currentVersion = 0) {
  const ARDUINO_CLI_BIN = getArduinoCliBinaryPath();
  
  // Tự động cài đặt thư viện từ source code trước khi build
  await installLibrariesFromSource(sourceCode);
  
  // Tạo version mới
  const newVersion = currentVersion + 1;
  
  // Tạo thư mục sketch (phải cùng tên với file .ino)
  const sketchName = `${deviceName}_v${newVersion}`;
  const tempDir = path.resolve('temp', sketchName);
  await fs.mkdir(tempDir, { recursive: true });

  // Parse escaped characters - convert literal \n, \t, etc. to actual characters
  // ONLY if the entire source code is escaped (typical when sent as JSON string)
  let processedCode = sourceCode;
  
  // Check if this looks like an escaped string (has \n but no actual newlines at start)
  const firstNewlineIndex = sourceCode.indexOf('\n');
  const firstEscapedNewline = sourceCode.indexOf('\\n');
  
  // If we find \\n before any real \n, this is likely an escaped string
  if (firstEscapedNewline !== -1 && (firstNewlineIndex === -1 || firstEscapedNewline < firstNewlineIndex)) {
    console.log('Detected escaped characters in source code, unescaping...');
    // Replace common escape sequences
    processedCode = sourceCode
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }

  // Tạo file .ino từ source code (tên file phải trùng với tên folder)
  const inoFile = path.join(tempDir, `${sketchName}.ino`);
  await fs.writeFile(inoFile, processedCode, 'utf8');

  // Debug: Log source code để kiểm tra
  console.log(`Creating ${inoFile}`);
  console.log(`Source code length: ${processedCode.length} bytes`);
  console.log(`Has setup(): ${processedCode.includes('void setup()')}`);
  console.log(`Has loop(): ${processedCode.includes('void loop()')}`);
  console.log(`First 3 lines:\n${processedCode.split('\n').slice(0, 3).join('\n')}`);

  // Đường dẫn output
  const outputDir = path.join(tempDir, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Build command với partition scheme cho OTA
    const buildProperties = [];
    
    // Cấu hình cho ESP32-C3 để giống Arduino IDE
    if (board.includes('esp32c3')) {
      // FQBN với đầy đủ options như Arduino IDE
      // min_spiffs = 1.9MB APP + OTA + 190KB SPIFFS (tối ưu cho OTA)
      board = 'esp32:esp32:esp32c3:CDCOnBoot=cdc,PartitionScheme=min_spiffs,CPUFreq=160,FlashMode=dio,FlashFreq=80,FlashSize=4M,UploadSpeed=921600,DebugLevel=none,EraseFlash=none';
    } else if (board.includes('esp32cam')) {
      // ESP32-CAM: Chỉ có CPUFreq, FlashMode, FlashFreq, PartitionScheme, DebugLevel, EraseFlash
      // min_spiffs = 1.9MB APP + OTA + 190KB SPIFFS
      board = 'esp32:esp32:esp32cam:PartitionScheme=min_spiffs,CPUFreq=240,FlashMode=qio,FlashFreq=80,DebugLevel=none,EraseFlash=none';
    } else if (board.includes('esp32')) {
      // ESP32 thường
      buildProperties.push('--build-property', 'build.partitions=min_spiffs');
      buildProperties.push('--build-property', 'build.flash_mode=dio');
      buildProperties.push('--build-property', 'build.flash_freq=80m');
    }
    
    // Không dùng --build-cache-path để Arduino CLI tự quản lý cache
    // Cache sẽ được lưu ở C:\Users\NGUYEN\AppData\Local\Temp\arduino\
    const cmd = [
      `"${ARDUINO_CLI_BIN}"`,
      'compile',
      '--fqbn', board,
      ...buildProperties,
      '--output-dir', `"${outputDir}"`,
      `"${inoFile}"`
    ].join(' ');

    console.log(`Building firmware for ${deviceName} (version ${newVersion})...`);
    console.log(`Build command: ${cmd}\n`);
    execSync(cmd, { stdio: 'inherit', timeout: 300000 });

    // Tìm file .bin
    const files = await fs.readdir(outputDir);
    const binFile = files.find(f => 
      f.endsWith('.bin') && 
      !f.includes('bootloader') && 
      !f.includes('partitions')
    );

    if (!binFile) throw new Error('Không tìm thấy file .bin sau khi build');

    // Tạo thư mục firmware cho device
    const firmwareDir = path.resolve('firmware_versions', deviceName);
    await fs.mkdir(firmwareDir, { recursive: true });

    // Di chuyển file .bin sang thư mục firmware với tên version
    const binSource = path.join(outputDir, binFile);
    const binDest = path.join(firmwareDir, `${newVersion}.bin`);
    await fs.copyFile(binSource, binDest);

    console.log(`✓ Build thành công! Version ${newVersion} → ${binDest}`);

    return {
      version: String(newVersion),
      binPath: path.join('firmware_versions', deviceName, `${newVersion}.bin`)
    };

  } finally {
    // Xóa thư mục temp
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Không thể xóa temp dir:', e.message);
    }
  }
}
