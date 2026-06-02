type LogData = Record<string, unknown>;
type LogLevel = "info" | "warn" | "error";

const SENSITIVE_KEY_PATTERN = /token|secret|key/i;

function redact(data: LogData): LogData {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      SENSITIVE_KEY_PATTERN.test(k) ? "[REDACTED]" : v,
    ])
  );
}

const isDev = process.env.NODE_ENV !== "production";

function log(level: LogLevel, message: string, data?: LogData): void {
  const redacted = data ? redact(data) : undefined;
  if (isDev) {
    if (redacted !== undefined) {
      console[level](message, redacted);
    } else {
      console[level](message);
    }
  } else {
    const entry = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...redacted,
    });
    process.stdout.write(entry + "\n");
  }
}

export const logger = {
  info: (message: string, data?: LogData) => log("info", message, data),
  warn: (message: string, data?: LogData) => log("warn", message, data),
  error: (message: string, data?: LogData) => log("error", message, data),
};
