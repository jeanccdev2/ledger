export class AppLogger {
  constructor(private readonly name: string) {}

  log(...messages: unknown[]) {
    const message = messages.join(" ");
    console.log(`[${this.name}]: ${message}`);
  }

  warn(...messages: unknown[]) {
    const message = messages.join(" ");
    console.warn(`[${this.name}]: ${message}`);
  }

  error(...messages: unknown[]) {
    const message = messages.join(" ");
    console.error(`[${this.name}]: ${message}`);
  }
}
