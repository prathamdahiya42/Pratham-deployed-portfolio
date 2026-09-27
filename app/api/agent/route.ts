import { handleAgentRequest } from '../../../api/agentHandler.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  return handleAgentRequest(req);
}
