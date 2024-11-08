import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const handleChat = async (req, res, next) => {
  console.log("채팅을 요청했습니다!");
  console.log("body:", req.body);

  const apiKey = process.env.API_KEY;
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
};
