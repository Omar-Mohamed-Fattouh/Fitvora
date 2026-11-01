// // File: src/contexts/Register.jsx
// const API_URL = "http://localhost:5000/api/auth";

// // Register function
// export const register = async (userData) => {
//   const response = await fetch(`${API_URL}/regist`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(userData),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Registration failed");
//   return data;
// };

// // Email check function
// export const checkEmailExists = async (email) => {
//   const response = await fetch(`${API_URL}/check-email`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email }),
//   });
//   const data = await response.json();
//   return data.exists; // Returns true/false
// };