import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", router);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
