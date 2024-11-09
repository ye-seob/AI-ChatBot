import axios from "axios";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

export const handleSpeech = async (req, res, next) => {
  const openApiURL = "https://apis.daglo.ai/stt/v1/sync/transcripts";
  const SPEECH_API_KEY = process.env.SPEECH_API_KEY;

  console.log("음성인식을 요청했습니다!");
  console.log("body:", req.body);

  const { fileName, audioFilePath } = req.body;

  try {
    const audioData = fs.readFileSync(audioFilePath).toString("base64"); //base64로 변환
    const requestData = {
      file: audioData,
      sttConfig: {
        model: "general", // 일반적인 모델을 사용
        ignoreNoisyInput: true, // 배경 소음을 무시하도록 설정
      },
      nnlpConfig: {
        textToNumber: {
          enable: true, // 텍스트를 숫자로 변환하는 기능 활성화
        },
      },
      returnElapsedTime: false, // 처리 시간을 반환하지 않음
      returnAudioDuration: false, // 오디오 길이를 반환하지 않음

      fileName: fileName, // 파일 이름 (확장자 포함되어야 함)
    };
    // POST 요청을 보냅니다.
    const response = await axios.post(openApiURL, requestData, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${SPEECH_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    res.status(StatusCodes.OK).json({ result: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "음성 인식 중 오류가 발생했습니다." });
  }
};

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
