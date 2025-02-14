export const SYSTEM_PROMPT =
  "あなたは面接の質問と回答セットから深い洞察を見出す専門家です。";

export const createUserPrompt = (
  callSummaries: string,
  interviewName: string,
  interviewObjective: string,
  interviewDescription: string,
) => {
  return `あなたは通話サマリーから深い洞察を見出す専門家のインタビュアーです。
    以下の通話サマリーと面接の詳細を使用して洞察を生成してください。
    
    ###
    通話サマリー: ${callSummaries}

    ###
    面接タイトル: ${interviewName}
    面接の目的: ${interviewObjective}
    面接の説明: ${interviewDescription}

    通話サマリーからユーザーフィードバックを強調する3つの洞察を提供してください。洞察のみを出力し、ユーザー名は含めないでください。
    各洞察は25文字以内にしてください。
    
    回答は"insights"をキーとし、3つの洞察の配列を値とするJSON形式で出力してください。`;
};
