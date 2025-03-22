const refreshAccessToken = async () => {
  const id = localStorage.getItem("id");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!id) {
    console.error("ID is missing in localStorage");
    return;
  }
  if (!refreshToken) {
    console.error("refreshToken is missing in localStorage");
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id, refreshToken: refreshToken }),
      // Thêm credentials: "include" để gửi cookie
    });

    if (!response.ok) {
      console.error(`Failed to refresh token: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken); // Lưu token mới
      localStorage.setItem("refreshToken", data.refreshToken); // Lưu token mới
      console.log("Access token refreshed:", data.accessToken);
      alert("goi ddc roi");
    } else {
      console.error("Failed to refresh access token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

export { refreshAccessToken };
