import { get, post } from "./request";

/**
 * User related API services
 */
export default {
  /**
   * User login
   * @param {Object} data - username and password
   */
  login: (data) => {
    return post("/api/user/login", data);
  },

  /**
   * User login with WeChat
   * @param {String} code - WeChat code
   */
  loginWithWeChat: async (code) => {
    return await get("/api/user/login/wx_open", { code });
  },

  /**
   * User registration
   * @param {Object} data - user information
   */
  register: (data) => {
    return post("/api/user/register", data);
  },

  /**
   * Get current logged in user
   */
  getCurrentUser: () => {
    return get("/api/user/get/login");
  },

  /**
   * Update user information
   * @param {Object} data - user information to update
   */
  updateUser: (data) => {
    return post("/api/user/update", data);
  },

  /**
   * Get user by ID
   * @param {Number} id - user ID
   */
  getUserById: (id) => {
    return get("/api/user/get", { id });
  },
};
