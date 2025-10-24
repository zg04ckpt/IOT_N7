import Admin from "../models/Admin.js";

// Repository pattern for Admin
// Encapsulates all database queries related to admins

class AdminRepository {
  // Get all admins
  async findAll() {
    try {
      const admins = await Admin.findAll();
      return admins;
    } catch (error) {
      throw new Error(`Error fetching admins: ${error.message}`);
    }
  }

  // Get admin by ID
  async findById(id) {
    try {
      const admin = await Admin.findByPk(id);
      return admin;
    } catch (error) {
      throw new Error(`Error fetching admin by ID: ${error.message}`);
    }
  }

  // Get admin by email
  async findByEmail(email) {
    try {
      const admin = await Admin.findOne({ where: { email } });
      return admin;
    } catch (error) {
      throw new Error(`Error fetching admin by email: ${error.message}`);
    }
  }

  // Create a new admin
  async create(data) {
    try {
      const admin = await Admin.create(data);
      return admin;
    } catch (error) {
      throw new Error(`Error creating admin: ${error.message}`);
    }
  }

  // Update admin by ID
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

  // Delete admin by ID
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
