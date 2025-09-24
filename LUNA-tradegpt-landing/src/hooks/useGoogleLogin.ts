import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import authService from "../services/authService";
import { useAuth } from "./useAuth.jsx";
import { useNavigate } from "react-router-dom";

interface UseGoogleLoginReturn {
  googleLoading: boolean;
  error: string;
  handleGoogleLogin: (idToken: string) => Promise<void>;
}

export const useGoogleLogin = (): UseGoogleLoginReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { updateUser, user, hasWorkspace } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async (idToken: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await authService.googleLogin(idToken);
      // authService.googleLogin đã lưu access_token/token/refresh_token/user vào localStorage
      if (result && result.user) {
        updateUser(result.user);
        queryClient.invalidateQueries();
        navigate("/post-auth", { replace: true });
      } else {
        setError("Không nhận được dữ liệu người dùng từ server");
      }
    } catch (err) {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    googleLoading,
    error,
    handleGoogleLogin,
  };
};
