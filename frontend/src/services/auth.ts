const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  username: string;
  email: string | null;
  role: string;
}

export const login = async (
  username: string,
  password: string,
): Promise<void> => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  // Cookie is set automatically by the backend
};

export const logout = async (): Promise<void> => {
  await fetch(`${API_URL}/auth/logout`, { method: "POST" });
  // Cookie is cleared by backend
  window.location.href = "/login";
};

export const signup = async (
  username: string,
  email: string,
  password: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Signup failed");
  }
};

export const getSession = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/me`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Session check failed", error);
    return null;
  }
};
