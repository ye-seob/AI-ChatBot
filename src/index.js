import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import StatusCodes from "http-status-codes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiKey = process.env.API_KEY;

const config = {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
};

app.post("/api/v1/chat", async (req, res) => {
  const prompt = req.body.prompt;
  const messages = [
    {
      role: "system",
      content: `한국말로 대답`, // gpt에게 시킬 것(역할 부여)
    },
    {
      role: "user",
      content: `${prompt}`,
    },
  ];

  try {
    const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", //gpt 모델 설정
        temperature: 0.7, //대답 창의성 (0~1)
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    res
      .status(StatusCodes.OK)
      .json({ result: result.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API 요청 중 오류 발생" });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
