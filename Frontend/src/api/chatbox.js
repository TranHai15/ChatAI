import axiosClient from "./axiosClient";

const ChatBox = {
  getAll: async (params) => {
    const url = "/user/";
    return axiosClient.get(url);
  },
};

export default ChatBox;
