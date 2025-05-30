import express from "express";
import identifyRoutes from "./routes/identify.route.js";
import sequelize from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());


app.use("/api", identifyRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Connected to RDS');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(5001, () => {
      console.log("Server running on http://localhost:5001");
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });