// const redis = require("redis");

// // Kết nối đến Redis server
// const client = redis.createClient({
//   host: "127.0.0.1", // hoặc "localhost"
//   port: 6379,
// });

// (async () => {
//   try {
//     await client.connect();
//     console.log("Redis connected!");
//     await client.set("name", "tran van hai");
//     const name = await client.get("name");
//     console.log("🚀 ~ name:", name);
//   } catch (err) {
//     console.error("Redis connection error:", err);
//   } finally {
//     await client.quit();
//   }
// })();
