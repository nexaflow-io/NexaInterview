import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dynamic_data, interviewer_id } = body;

    logger.info("Creating web call with data:", {
      interviewer_id,
      dynamic_data,
    });

    const interviewer = await InterviewerService.getInterviewer(interviewer_id);
    if (!interviewer) {
      throw new Error("Interviewer not found");
    }

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: interviewer.agent_id,
      retell_llm_dynamic_variables: dynamic_data,
    });

    logger.info("Web call created successfully:", registerCallResponse);

    return NextResponse.json({ 
      registerCallResponse: {
        call_id: registerCallResponse.call_id,
        access_token: registerCallResponse.access_token,
        sample_rate: registerCallResponse.sample_rate
      }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating web call:", {
      error: errorMessage,
      details: error,
    });

    return NextResponse.json(
      { error: "Failed to create web call", details: errorMessage },
      { status: 500 },
    );
  }
}
