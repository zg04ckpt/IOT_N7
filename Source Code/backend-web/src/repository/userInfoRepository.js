import UserInfo from "../models/UserInfo.js";

class UserInfoRepository {
  async findAll() {
    try {
      const userInfos = await UserInfo.findAll();
      return userInfos;
    } catch (error) {
      throw new Error(`Error fetching user infos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const userInfo = await UserInfo.findByPk(id);
      return userInfo;
    } catch (error) {
      throw new Error(`Error fetching user info by ID: ${error.message}`);
    }
  }

  async findByPhone(phone) {
    try {
      const userInfo = await UserInfo.findOne({ where: { phone } });
      return userInfo;
    } catch (error) {
      throw new Error(`Error fetching user info by phone: ${error.message}`);
    }
  }

  async findByLicensePlate(licensePlate) {
    try {
      const userInfo = await UserInfo.findOne({ where: { licensePlate } });
      return userInfo;
    } catch (error) {
      throw new Error(
        `Error fetching user info by license plate: ${error.message}`
      );
    }
  }

  async create(data) {
    try {
      const userInfo = await UserInfo.create(data);
      return userInfo;
    } catch (error) {
      console.error("Sequelize validation error:", error.errors);
      console.error("Error detail:", error.message);
      throw new Error(
        `Error creating user info: ${
          error.errors?.[0]?.message || error.message
        }`
      );
    }
  }

  async update(id, data) {
    try {
      const userInfo = await UserInfo.findByPk(id);
      if (!userInfo) {
        throw new Error("User info not found");
      }
      await userInfo.update(data);
      return userInfo;
    } catch (error) {
      throw new Error(`Error updating user info: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const userInfo = await UserInfo.findByPk(id);
      if (!userInfo) {
        throw new Error("User info not found");
      }
      await userInfo.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user info: ${error.message}`);
    }
  }
}

export default new UserInfoRepository();
