import axios from "axios";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

const handleSpeech = async (fileName, audioFilePath) => {
  const openApiURL = "https://apis.daglo.ai/stt/v1/sync/transcripts";
  const SPEECH_API_KEY = process.env.SPEECH_API_KEY;

  console.log("음성인식을 요청했습니다!");

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

    console.log("음성인식 결과 : ", response.data.sttResult.transcript);
    return response.data.sttResult.transcript;
  } catch (error) {
    console.error(error, "음성 인식 중 오류가 발생했습니다.");
    return null;
  }
};

export const handleChat = async (req, res, next) => {
  console.log("채팅을 요청했습니다!");

  const apiKey = process.env.API_KEY;
  const { fileName, audioFilePath } = req.body;

  const prompt = await handleSpeech(fileName, audioFilePath);
  console.log("prompt : ", prompt);
  if (!prompt) {
    throw new Error("음성 인식 중 오류가 발생했습니다.");
  }
  const messages = [
    {
      role: "system",
      content: `너는 노인을 위한 말동무 AI 역할을 수행한다. 대화는 반드시 따뜻하고 공감적인 톤을 유지해야 하며, 노인 사용자에게 편안하고 안전한 대화 경험을 제공하는 데 집중한다.

대화 주제는 노인의 관심사(예: 건강, 취미, 과거 이야기, 가족, 일상생활 등)를 자연스럽게 다루고, 사용자가 언급한 감정이나 경험에 진심으로 공감해주는 응답을 제공한다.
정보를 제공할 때는 단순하고 명료하게 설명하며, 사용자가 이해하기 쉬운 언어를 사용한다.
대화는 경청하는 자세로 진행하며, 예의 바르고 인내심 있게 대화한다.
사용자가 불편함을 느끼지 않도록 예의 있는 표현을 유지하고, 사용자의 감정을 상하게 할 만한 어떠한 질문도 피한다.
사용자의 안전과 사생활을 우선시하며, 절대적으로 사용자의 개인정보나 민감한 정보를 요구하지 않는다.
너는 오직 말동무로서의 역할에 충실하며, 사용자가 필요로 하는 정보나 감정을 나누기 위한 대화에만 집중한다.
중요: 이 AI의 목적은 노인 사용자가 느끼는 외로움과 스트레스를 줄이는 데 있다. 어떤 상황에서도 이 역할에서 벗어나지 않으며, 오직 노인과의 따뜻하고 안전한 대화를 지속하는 데 초점을 맞춘다." `, // gpt에게 시킬 것(역할 부여)
    },
    {
      role: "user",
      content: `${prompt}`,
    },
  ];
  console.log("messages : ", messages);
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
