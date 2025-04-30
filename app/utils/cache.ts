export class Cache<T> {
    private data: T | null = null;
    private timestamp: number | null = null;
    private readonly duration: number;

    constructor(duration: number) {
        this.duration = duration;
    }

    set(data: T): void {
        this.data = data;
        this.timestamp = Date.now();
    }

    get(): T | null {
        if (!this.data || !this.timestamp) {
            return null;
        }

        if (Date.now() - this.timestamp > this.duration) {
            this.clear();
            return null;
        }

        return this.data;
    }

    clear(): void {
        this.data = null;
        this.timestamp = null;
    }

    isValid(): boolean {
        return this.data !== null && this.timestamp !== null && (Date.now() - this.timestamp) < this.duration;
    }
}
