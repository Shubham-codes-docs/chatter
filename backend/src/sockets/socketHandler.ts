type AckCallback = (response: { success: boolean; error?: string }) => void;

export const socketHandler = (handler: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (error) {
      const callback = args[args.length - 1] as AckCallback;
      if (typeof callback === "function") {
        callback({
          success: false,
          error:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }
    }
  };
};
