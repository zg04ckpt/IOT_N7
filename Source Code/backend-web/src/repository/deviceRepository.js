import Device from "../models/Device.js";

class DeviceRepository {
  async findAll() {
    try {
      const devices = await Device.findAll();
      return devices;
    } catch (error) {
      throw new Error(`Error fetching devices: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const device = await Device.findByPk(id);
      return device;
    } catch (error) {
      throw new Error(`Error fetching device by ID: ${error.message}`);
    }
  }

  async findByLocation(location) {
    try {
      const devices = await Device.findAll({ where: { location } });
      return devices;
    } catch (error) {
      throw new Error(`Error fetching devices by location: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const device = await Device.create(data);
      return device;
    } catch (error) {
      throw new Error(`Error creating device: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        throw new Error("Device not found");
      }
      await device.update(data);
      return device;
    } catch (error) {
      throw new Error(`Error updating device: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        throw new Error("Device not found");
      }
      await device.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting device: ${error.message}`);
    }
  }
}

export default new DeviceRepository();
