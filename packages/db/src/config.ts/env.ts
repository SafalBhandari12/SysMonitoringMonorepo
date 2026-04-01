import dotenv from "dotenv";

dotenv.config();

const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || "",
};

export default ENV;
