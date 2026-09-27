import { handleAgentRequest } from '../../api/agentHandler.js';

export default async (req, context) => {
  return handleAgentRequest(req);
};

export const config = {
  path: '/api/agent',
};
