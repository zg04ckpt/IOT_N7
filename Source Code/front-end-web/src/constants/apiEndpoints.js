const cardRoot = "/cards";
const userRoot = "/users";
const sessionRoot = "/sessions";
const invoiceRoot = "/invoices";
const deviceRoot = "/devices";
const enumRoot = "/enums";

export const endpoints = {
  card: {
    root: cardRoot,
    registerMonthlyCard: (id) => `${cardRoot}/${id}/register-monthly`,
    unregisterMonthlyCard: (id) => `${cardRoot}/${id}/unregister-monthly`,
    getById: (id) => `${cardRoot}/${id}`,
    deleteById: (id) => `${cardRoot}/${id}`,
    getByUid: (uid) => `${cardRoot}/info?uid=${uid}`,
  },
  user: {
    root: userRoot,
    login: `${userRoot}/login`,
    logout: `${userRoot}/logout`,
    getById: (id) => `${userRoot}/${id}`,
    deleteById: (id) => `${userRoot}/${id}`,
    register: `${userRoot}/register`,
    profile: `${userRoot}/profile`,
  },
  session: {
    root: sessionRoot,
    checkInOut: `${sessionRoot}/check`,
  },
  invoice: {
    root: invoiceRoot,
    stats: `${invoiceRoot}/stats`,
    getById: (id) => `${invoiceRoot}/${id}`,
    getBySessionId: (sessionId) => `${invoiceRoot}/session/${sessionId}`,
  },
  device: {
    root: deviceRoot,
    getById: (id) => `${deviceRoot}/${id}`,
    updateVersion: (id) => `${deviceRoot}/${id}/versions`,
    deleteById: (id) => `${deviceRoot}/${id}`,
  },
  enum: {
    root: enumRoot,
    roles: `${enumRoot}/roles`,
  },
  health: "/health",
};
