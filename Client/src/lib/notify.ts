/**
 * Central notification API for the app.
 * Use this instead of calling a toast library directly.
 * Ensures consistent duration, placement, and behavior.
 */

import { toast } from "sonner";

const DEFAULT_DURATION_MS = 4500;
const ERROR_DURATION_MS = 6000;

export const notify = {
  success: (message: string) => {
    toast.success(message, { duration: DEFAULT_DURATION_MS });
  },

  error: (message: string) => {
    toast.error(message, { duration: ERROR_DURATION_MS });
  },

  warning: (message: string) => {
    toast.warning(message, { duration: DEFAULT_DURATION_MS });
  },

  info: (message: string) => {
    toast.info(message, { duration: DEFAULT_DURATION_MS });
  },
};
