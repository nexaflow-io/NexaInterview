import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import { INTERVIEWERS, RETELL_AGENT_GENERAL_PROMPT } from "@/lib/constants";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function GET(req: Request) {
  logger.info("create-interviewer request received");

  try {
    const newModel = await retellClient.llm.create({
      model: "gpt-4o",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT,
      system_prompt: `You are a Japanese-speaking interviewer. All communication must be in Japanese.
- Always respond in natural, conversational Japanese
- Use appropriate levels of politeness (です/ます体)
- Understand and respond to Japanese audio input
- Keep the conversation professional yet friendly`,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "「さようなら」「ありがとうございました」「お疲れ様でした」などの別れの挨拶が聞かれた場合、通話を終了します。",
        },
      ],
    });

    // Create Lisa
    const newFirstAgent = await retellClient.agent.create({
      response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Chloe",
      agent_name: "リサ",
      language: "ja-JP",  // 正しい言語コードを使用
    });

    const newInterviewer = await InterviewerService.createInterviewer({
      agent_id: newFirstAgent.agent_id,
      ...INTERVIEWERS.LISA,
    });

    // Create Bob
    const newSecondAgent = await retellClient.agent.create({
      response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Brian",
      agent_name: "ボブ",
      language: "ja-JP",  // 正しい言語コードを使用
    });

    const newSecondInterviewer = await InterviewerService.createInterviewer({
      agent_id: newSecondAgent.agent_id,
      ...INTERVIEWERS.BOB,
    });

    logger.info("Interviewers created successfully:", {
      firstAgent: newFirstAgent,
      secondAgent: newSecondAgent
    });

    return NextResponse.json(
      {
        newInterviewer,
        newSecondInterviewer,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating interviewers:", {
      error: errorMessage,
      details: error
    });

    return NextResponse.json(
      { 
        error: "Failed to create interviewers",
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 },
    );
  }
}
