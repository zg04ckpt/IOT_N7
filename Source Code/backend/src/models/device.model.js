export const BoardType = Object.freeze({
    ESP32C3: 'esp32:esp32:esp32c3',
    ESP32CAM: 'esp32:esp32:esp32cam'
});

export const DeviceStatus = Object.freeze({
    RUNNING: 'running',
    UPDATING: 'updating',
    UPDATED: 'updated',
    OFFLINE: 'offline'
});

export class Device {
    constructor(data = {}) {
        this.id = data?.id ?? null;
        this.name = data?.name ?? null;
        this.board = data?.board ?? null;
        this.latest_version = data?.latest_version ?? null;
        this.curr_version = data?.curr_version ?? null;
        this.total_versions = data?.total_versions ?? 0;
        this.firmware_folder_path = data?.firmware_folder_path ?? null;
        this.status = data?.status ?? DeviceStatus.OFFLINE;
        this.key = data?.key ?? null;
        this.created_at = data?.created_at ?? null;
        this.updated_at = data?.updated_at ?? null;
    }

    static isValidName(name) {
        return name && name.length > 0 && name.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(name);
    }

    static isValidBoard(board) {
        return board && Object.values(BoardType).includes(board);
    }

    static isValidStatus(status) {
        return status && Object.values(DeviceStatus).includes(status);
    }

    toModel() {
        return {
            id: this.id,
            name: this.name,
            board: this.board,
            latest_version: this.latest_version,
            curr_version: this.curr_version,
            total_versions: this.total_versions,
            firmware_folder_path: this.firmware_folder_path,
            status: this.status,
            key: this.key,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
