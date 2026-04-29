import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export interface User {
  userId: number;
  username: string;
  fullName: string;
  email?: string;
  photoUrl?: string;
  employeeId?: string;
  division?: string;
  isActive: boolean;
  roleId: number;
  roleName?: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  permissions: string[];
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/api/auth/login", { username, password });

      // Backend wraps response: { statusCode, message, data: { token, user, permissions, ... } }
      const data: LoginResponse = response.data.data;

      if (!data?.token) {
        throw new Error("Response tidak valid dari server");
      }

      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("permissions", JSON.stringify(data.permissions || []));

      return data;
    } catch (error: any) {
      // Extract meaningful error message from backend
      const msg =
        error.response?.data?.data?.message ||
        error.response?.data?.message ||
        error.message ||
        "Login gagal";
      throw new Error(msg);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("permissions");
  },

  getStoredUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem("authToken");
  },

  getPermissions: async (): Promise<string[]> => {
    const str = await AsyncStorage.getItem("permissions");
    return str ? JSON.parse(str) : [];
  },

  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  },
};
