export class AppLogger {
  constructor(private readonly name: string) {}

  log(...messages: unknown[]) {
    console.log(`[${this.name}]: `, ...messages);
  }

  warn(...messages: unknown[]) {
    console.warn(`[${this.name}]: `, ...messages);
  }

  error(...messages: unknown[]) {
    console.error(`[${this.name}]: `, ...messages);
  }
}
