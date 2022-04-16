export class EventType<Payload = never> {
    payload?: Payload;
    symbol = Symbol();

    constructor(public description: string = '') {
    }
}

export interface Listener<Payload = never> {
    (payload: Payload): void;
}

export class EventDispatcher {
    constructor() {
    }

    private _listeners: Map<Symbol, Listener[]>;
    private get listeners() {
        if (!this._listeners) this._listeners = new Map(); //saves some memory
        return this._listeners;
    }

    public on<T>(type: EventType<T>, listener: Listener<T>): void {
        let listeners = this.listeners.get(type.symbol);
        if (!listeners) this.listeners.set(type.symbol, listeners = []);

        if (listeners.indexOf(listener) < 0) {
            listeners.push(listener);
        }
    }

    public once<T>(type: EventType<T>, listener: Listener<T>): void {
        const remover = () => {
            this.off(type, listener);
            this.off(type, remover);
        };
        this.on(type, listener);
        this.on(type, remover);
    }

    public has<T>(type: EventType<T>, listener: Listener<T>): boolean {
        const listeners = this.listeners.get(type.symbol);
        return listeners && listeners.indexOf(listener) >= 0;
    }

    public off<T>(type: EventType<T>, listener: Listener<T>) {
        const listeners = this.listeners.get(type.symbol);
        if (!listeners) return;

        const index = listeners.indexOf(listener);
        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }

    public fire<T>(type: EventType<T>, payload?: T): void {
        const rawListeners = this.listeners.get(type.symbol);
        if (rawListeners !== undefined) {
            const listeners = rawListeners.slice();
            if (listeners !== undefined) {
                for (let i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].call(this, payload);
                }
            }
        }
    }
}
