export const saveToken = (token) => {
  localStorage.setItem("zila-admin-token", token);
  // Set cookie so Next.js middleware can read it for route protection
  document.cookie = `zila-admin-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const getToken = () => {
  return localStorage.getItem("zila-admin-token");
};

export const removeToken = () => {
  localStorage.removeItem("zila-admin-token");
  // Remove cookie
  document.cookie = "zila-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};
