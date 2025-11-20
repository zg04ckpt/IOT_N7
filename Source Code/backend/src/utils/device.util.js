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
  if (platform === 'win32') {
    const inDir = path.join(ARDUINO_CLI_DIR, 'arduino-cli.exe');
    if (fsSync.existsSync(inDir)) return inDir;

    const outside = path.join(TOOLS_DIR, 'arduino-cli.exe');
    if (fsSync.existsSync(outside)) return outside;

    throw new Error('arduino-cli chưa được cài đặt');
  }
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
  console.log('✓ arduino-cli đã tải xong');
  return getArduinoCliBinaryPath();
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
 * Build firmware từ source code
 * @param {string} sourceCode - Mã nguồn .ino
 * @param {string} deviceName - Tên thiết bị
 * @param {string} board - Board type (fqbn)
 * @param {number} currentVersion - Version hiện tại
 * @returns {Promise<{version: string, binPath: string}>}
 */
export async function buildFirmware(sourceCode, deviceName, board, currentVersion = 0) {
  const ARDUINO_CLI_BIN = getArduinoCliBinaryPath();
  
  // Tạo version mới
  const newVersion = currentVersion + 1;
  
  // Tạo thư mục sketch (phải cùng tên với file .ino)
  const sketchName = `${deviceName}_v${newVersion}`;
  const tempDir = path.resolve('temp', sketchName);
  await fs.mkdir(tempDir, { recursive: true });

  // Tạo file .ino từ source code (tên file phải trùng với tên folder)
  const inoFile = path.join(tempDir, `${sketchName}.ino`);
  await fs.writeFile(inoFile, sourceCode);

  // Đường dẫn output
  const outputDir = path.join(tempDir, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Build command
    const cmd = [
      `"${ARDUINO_CLI_BIN}"`,
      'compile',
      '--fqbn', board,
      '--output-dir', `"${outputDir}"`,
      '--build-cache-path', `"${path.join(outputDir, '.cache')}"`,
      `"${inoFile}"`
    ].join(' ');

    console.log(`Building firmware for ${deviceName} (version ${newVersion})...`);
    execSync(cmd, { stdio: 'inherit', timeout: 120000 });

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
