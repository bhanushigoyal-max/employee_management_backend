import { MESSAGES } from '../lang/messages';

export const getHealthStatus = () => {
  return {
    success: true,
    message: MESSAGES.SYSTEM.SERVER_RUNNING,
  };
};
