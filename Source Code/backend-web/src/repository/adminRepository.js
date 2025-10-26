import Admin from "../models/Admin.js";

class AdminRepository {
  async findAll() {
    try {
      const admins = await Admin.findAll();
      return admins;
    } catch (error) {
      throw new Error(`Error fetching admins: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const admin = await Admin.findByPk(id);
      return admin;
    } catch (error) {
      throw new Error(`Error fetching admin by ID: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const admin = await Admin.findOne({ where: { email } });
      return admin;
    } catch (error) {
      throw new Error(`Error fetching admin by email: ${error.message}`);
    }
  }

  async findByUsername(username) {
    try {
      const admin = await Admin.findOne({ where: { username } });
      return admin;
    } catch (error) {
      throw new Error(`Error fetching admin by username: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const admin = await Admin.create(data);
      return admin;
    } catch (error) {
      throw new Error(`Error creating admin: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const admin = await Admin.findByPk(id);
      if (!admin) {
        throw new Error("Admin not found");
      }
      await admin.update(data);
      return admin;
    } catch (error) {
      throw new Error(`Error updating admin: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const admin = await Admin.findByPk(id);
      if (!admin) {
        throw new Error("Admin not found");
      }
      await admin.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting admin: ${error.message}`);
    }
  }
}

export default new AdminRepository();
