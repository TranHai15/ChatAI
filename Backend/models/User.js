import connectDatabase from "../db.js";
import moment from "moment-timezone";
function dateTime() {
  return moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
}
class User {
  constructor() {
    this.connection = null;
  }

  // Kết nối với cơ sở dữ liệu khi tạo đối tượng User
  async connect() {
    if (!this.connection) {
      this.connection = await connectDatabase();
      console.log("Database connected");
    }
  }

  // Đóng kết nối với cơ sở dữ liệu
  async closeConnection() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log("Database connection closed");
    }
  }

  // Tạo hàm thêm dữ liệu vào database
  static async insertUser(username, password, email, role) {
    const user = new User();
    await user.connect();

    const insert = `INSERT INTO  users (username, fullname,password, email, phong_ban, role_id, create_at, update_at)  VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    const create_at = dateTime();
    console.log("🚀 ~ User ~ insertUser ~ create_at:", create_at);
    try {
      const name = "demo";
      const phong_ban = "demo";
      const [result] = await user.connection.execute(insert, [
        name,
        username,
        password,
        email,
        phong_ban,
        role,
        create_at,
        create_at
      ]);
      console.log("User added:", result.insertId);
      return result.insertId; // Trả về ID của người dùng đã thêm
    } catch (error) {
      console.error("Error inserting user:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  static async insertUseradmin(name, username, password, role, phong_ban) {
    const user = new User();
    await user.connect();

    const insert = `INSERT INTO  users (username, fullname ,password, phong_ban, role_id, create_at, update_at)  VALUES (?, ?, ?, ?, ?, ?,?)`;

    const create_at = dateTime();
    console.log("🚀 ~ User ~ insertUser ~ create_at:", create_at);
    try {
      const [result] = await user.connection.execute(insert, [
        name,
        username,
        password,
        phong_ban,
        role,
        create_at,
        create_at
      ]);
      console.log("User added:", result.insertId);
      return result.insertId; // Trả về ID của người dùng đã thêm
    } catch (error) {
      console.error("Error inserting user:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Kiểm tra xem đã tồn tại email chưa
  static async checkEmailExists(username, data = false) {
    const user = new User();
    await user.connect();

    const query = `SELECT * FROM users WHERE username = ?`;

    try {
      const [rows] = await user.connection.execute(query, [username]);
      console.log("🚀 ~ User ~ checkEmailExists ~ rows:", rows);
      if (!data) {
        return rows.length > 0; // Nếu có bản ghi, trả về true
      } else {
        return rows[0]; // Trả về bản ghi đầu tiên nếu có dữ liệu
      }
    } catch (error) {
      console.error("Error checking email:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Lấy toàn bộ người dùng
  static async getUsers() {
    const user = new User();
    await user.connect();
    const query = `SELECT 
    u.id,
    u.fullname,
    u.username,
    u.role_id,
    u.email,
    u.phong_ban,
    u.create_at,
    u.update_at,
    r.role_name,
    r.description
FROM users u
LEFT JOIN Roles r ON u.role_id = r.role_id;

`;
    try {
      const [rows] = await user.connection.execute(query);
      return rows;
    } catch (error) {
      console.error("Không lấy được dữ liệu người dùng:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  //  lay toan bo lich su chat
  static async getAllChat(id) {
    const user = new User();
    await user.connect();

    const query = `SELECT 
    ch.*, 
    a.fullname, 
    a.email
FROM 
    chat_history AS ch
JOIN 
    users AS a
ON 
    ch.id = a.id
WHERE 
    ch.id = ?
ORDER BY 
    ch.create_at DESC;
 `;

    try {
      const [rows] = await user.connection.execute(query, [id]);
      return rows; // Trả về tất cả n=
    } catch (error) {
      console.error("Không lấy được dữ liệu lich su chat:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  static async updateNotifi(id, update_at) {
    const user = new User();
    await user.connect();

    const query = `
      UPDATE notifications
      SET is_read = 1, updated_at = ?
      WHERE id = ?`;
    const values = [update_at, id];

    try {
      const [result] = await user.connection.execute(query, values);
      console.log("🚀 ~ User ~ updateNotifi ~ result:", result);
      return result.affectedRows; // Trả về số hàng đã được cập nhật
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  static async getAllNoffition() {
    const user = new User();
    await user.connect();

    const query = `SELECT 
    users.id AS user_id,
    users.username,
    users.fullname,
    users.email,
    users.phong_ban,
    n.id AS task_id,
    n.task,
    n.deadline,
    n.status,
    n.is_read,
    n.created_at
FROM users
LEFT JOIN notifications AS n ON users.id = n.user_id
 ORDER BY created_at desc `;

    try {
      const [rows] = await user.connection.execute(query);
      return rows;
    } catch (error) {
      console.error("Không lấy được dữ liệu lich su chat:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  static async insertNof(tasks) {
    const user = new User();
    await user.connect();

    const query = `
    INSERT INTO notifications (user_id, task, deadline, status, is_read, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
      // Dùng Promise.all để chạy nhiều truy vấn song song
      await Promise.all(
        tasks.map(async (element) => {
          try {
            const values = [
              element.id_user,
              element.task,
              element.deadline,
              "pending",
              0,
              dateTime(),
              dateTime()
            ];
            const [result] = await user.connection.execute(query, values);
            console.log(
              `✅ Task inserted: ${element.task} (User ID: ${element.id_user})`
            );
          } catch (error) {
            console.error(`❌ Error inserting task ${element.task}:`, error);
          }
        })
      );
    } catch (error) {
      console.error("🚨 Error inserting notifications:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối sau khi tất cả truy vấn hoàn tất
    }
  }

  // lấy chat theo id chat
  static async getAllChatByIdChat_id(id) {
    const user = new User();
    await user.connect();

    const query = `SELECT role , content FROM chat_history_detail WHERE chat_id = ? ORDER BY create_at ASC `;

    try {
      const [rows] = await user.connection.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error("Không lấy được dữ liệu lich su chat:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Xóa người dùng
  static async delete(id) {
    const user = new User();
    await user.connect();

    const query = `DELETE FROM users WHERE id = ?`;

    try {
      const [result] = await user.connection.execute(query, [id]);
      return result.affectedRows; // Trả về số bản ghi đã xóa
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  //  lấy thông báo
  static async getNotification(id) {
    const user = new User();
    await user.connect();

    const query = `SELECT is_read , status,deadline,task ,id FROM notifications WHERE user_id = ? ORDER BY created_at desc `;

    try {
      const [rows] = await user.connection.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error("Không lấy được dữ liệu lich su chat:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Thêm phiên đăng nhập
  static async insertSession(userId, accessToken, refreshToken, expiresAt) {
    const user = new User();
    await user.connect();

    const query = `INSERT INTO user_sessions (id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)`;
    const values = [userId, accessToken, refreshToken, expiresAt];

    try {
      const [result] = await user.connection.execute(query, values);
      return result.insertId; // Trả về ID của phiên đã thêm
    } catch (error) {
      console.error("Error inserting session:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // update phien nguoi dung
  static async updateSession(userId, accessToken, refreshToken, expiresAt) {
    const user = new User();
    await user.connect();

    const query = `
      UPDATE user_sessions
      SET access_token = ?, refresh_token = ?, expires_at = ?
      WHERE id = ?`;
    const values = [accessToken, refreshToken, expiresAt, userId];

    try {
      const [result] = await user.connection.execute(query, values);
      return result.affectedRows; // Trả về số hàng đã được cập nhật
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // them lich su cau hoi vao database
  static async insertMessage(chat_id, id, chat_title, create_at) {
    const user = new User();
    await user.connect();

    const query = `INSERT INTO chat_history (chat_id, id, chat_title, create_at) VALUES (?, ?, ?, ?)`;
    const values = [chat_id, id, chat_title, create_at];

    try {
      const [result] = await user.connection.execute(query, values);
      return result.insertId; // Trả về ID của phiên đã thêm
    } catch (error) {
      console.error("Error inserting session:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  static async checkRoomExists(roomId) {
    const user = new User();
    await user.connect();
    const query = `SELECT chat_id FROM chat_history WHERE chat_id = ? `;
    const values = [roomId];
    try {
      const [result] = await user.connection.execute(query, values);
      return result.length > 0; // Trả về true nếu phòng tồn tại
    } catch (error) {
      console.error("Error checking room:", error.message);
      throw error;
    }
  }

  // them du lieu vao lich su chat

  static async inssertOnechat(chat_id, role, content, create_at) {
    const user = new User();
    await user.connect();

    const query = `INSERT INTO chat_history_detail (chat_id, role, content, create_at) VALUES (?, ?, ?, ?)`;
    const values = [chat_id, role, content, create_at];

    try {
      const [result] = await user.connection.execute(query, values);
      return result.insertId; // Trả về ID của phiên đã thêm
    } catch (error) {
      console.error("Error inserting session:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Lấy phiên đăng nhập theo userId
  static async getSessionByUserId(userId, check = false) {
    const user = new User();
    await user.connect();

    let query = "";
    if (check) {
      query = `SELECT refresh_token  FROM user_sessions WHERE id = ?`;
    } else {
      query = `SELECT COUNT(*) AS session_count FROM user_sessions WHERE id = ? `;
    }

    try {
      const [results] = await user.connection.execute(query, [userId]);
      return results; // Trả về các phiên đăng nhập
    } catch (error) {
      console.error("Lỗi khi lấy phiên đăng nhập:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Xóa phiên đăng nhập
  static async deleteSession(userId) {
    const user = new User();
    await user.connect();

    const query = `DELETE FROM user_sessions WHERE id = ?`;

    try {
      const [result] = await user.connection.execute(query, [userId]);
      return result.affectedRows; // Trả về số phiên đã xóa
    } catch (error) {
      console.error("Lỗi khi xóa phiên đăng nhập:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  // Cập nhật refresh token
  static async updateRefreshToken(userId, newRefreshToken) {
    const user = new User();
    await user.connect();

    const query = `UPDATE user_sessions SET refresh_token = ? WHERE id = ?`;

    try {
      const [result] = await user.connection.execute(query, [
        newRefreshToken,
        userId
      ]);
      return result.affectedRows > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
      console.error("Error updating refresh token:", error);
      return false; // Trả về false nếu có lỗi
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }

  //
  static async getAccount() {
    const user = new User();
    await user.connect();
    const query = `SELECT COUNT(*) FROM users`;
    try {
      const [result] = await user.connection.execute(query);
      return result;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await user.closeConnection();
    }
  }
  static async getActiveAccount() {
    const user = new User();
    await user.connect();
    const query = `SELECT COUNT(*) FROM user_sessions`;
    try {
      const [result] = await user.connection.execute(query);
      return result;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await user.closeConnection();
    }
  }
  static async getHistoryChat(day) {
    const user = new User();
    await user.connect();
    try {
      let intervalQuery = "";
      switch (day) {
        case "1":
          intervalQuery = "INTERVAL 1 DAY";
          break;
        case "3":
          intervalQuery = "INTERVAL 3 DAY";
          break;
        case "7":
          intervalQuery = "INTERVAL 7 DAY";
          break;
        case "30":
          intervalQuery = "INTERVAL 1 MONTH";
          break;
        case "180":
          intervalQuery = "INTERVAL 6 MONTH";
          break;
        case "365":
          intervalQuery = "INTERVAL 1 YEAR";
          break;
        default:
          intervalQuery = "INTERVAL 1 DAY"; // Mặc định nếu giá trị không hợp lệ
      }
      console.log("🚀 ~ User ~ getHistoryChat ~ intervalQuery:", intervalQuery);

      // Truy vấn SQL lấy dữ liệu theo khoảng thời gian
      const sql = `
      SELECT DATE(create_at) AS date, COUNT(*) AS total_questions
      FROM chat_history_detail
      WHERE create_at >= NOW() - ${intervalQuery}
      GROUP BY DATE(create_at)
      ORDER BY date ASC
    `;

      const [rows] = await user.connection.execute(sql);
      return rows;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    } finally {
      await user.closeConnection();
    }
  }
  static async getInfosUser(id) {
    const user = new User();
    await user.connect();
    const query = `SELECT a.*, c.chat_id,c.chat_title,c.create_at AS chat_create FROM users a left JOIN chat_history c ON a.id = c.id WHERE a.id = ? ;
`;
    try {
      const [result] = await user.connection.execute(query, [id]);
      console.log("🚀 ~ User ~ getHistoryChat ~ result:", result);
      return result;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await user.closeConnection();
    }
  }
  static async getInfosUserChatDetail(content) {
    const user = new User();
    await user.connect();

    const query = `SELECT a.id, a.email, a.username, a.create_at, a.role_id,a.password AS statuss,
       MAX(c.chat_id) AS chat_id, 
       MAX(ch.content) AS content
FROM chat_history_detail ch
JOIN chat_history c ON c.chat_id = ch.chat_id
JOIN users a ON a.id = c.id
WHERE ch.content LIKE "%${content}%" AND ch.role="user"
GROUP BY a.id;
`;
    try {
      const [result] = await user.connection.execute(query, [content]);

      return result;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await user.closeConnection();
    }
  }
  static async updateUser(
    name,
    username,
    password,
    phong_ban,
    role,
    createdAt,
    id
  ) {
    const user = new User();
    await user.connect();
    const query = `UPDATE users
                    SET username = ?, fullname =?, password = ?, phong_ban = ?, role_id = ?, create_at = ? ,update_at = ?
                    WHERE id = ?;
`;
    try {
      const [result] = await user.connection.execute(query, [
        name,
        username,
        password,
        phong_ban,
        role,
        dateTime(),
        dateTime(),
        id
      ]);
      // console.log("🚀 ~ User ~ getHistoryChat ~ result:", result);
      return result.affectedRows;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await user.closeConnection();
    }
  }
}

export default User;
