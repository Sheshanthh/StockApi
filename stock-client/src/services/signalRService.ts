import * as signalR from '@microsoft/signalr';

type PendingOperation = () => Promise<void>;

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private orderBookCallbacks: ((data: any) => void)[] = [];
    private tradeCallbacks: ((data: any) => void)[] = [];
    private isConnecting: boolean = false;
    private subscribedSymbols: Set<string> = new Set();
    private reconnectTimer: NodeJS.Timeout | null = null;
    private connectionPromise: Promise<void> | null = null;
    private connectionState: signalR.HubConnectionState = signalR.HubConnectionState.Disconnected;
    private pendingOperations: PendingOperation[] = [];
    private isProcessingQueue: boolean = false;

    constructor() {
        this.initializeConnection();
        // Start connection immediately
        this.start();
    }

    private initializeConnection() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/hubs/stock')
            .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        this.connection.on('OrderBookUpdate', (data) => {
            console.log('Received OrderBook Update:', data);
            this.orderBookCallbacks.forEach(callback => callback(data));
        });

        this.connection.on('TradeUpdate', (data) => {
            console.log('Received Trade Update:', data);
            this.tradeCallbacks.forEach(callback => callback(data));
        });

        this.connection.onclose((error) => {
            console.log('SignalR Connection Closed:', error);
            this.isConnecting = false;
            this.connectionPromise = null;
            this.connectionState = signalR.HubConnectionState.Disconnected;
            this.handleReconnect();
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR Reconnecting:', error);
            this.connectionState = signalR.HubConnectionState.Reconnecting;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR Reconnected:', connectionId);
            this.isConnecting = false;
            this.connectionPromise = null;
            this.connectionState = signalR.HubConnectionState.Connected;
            this.processPendingOperations();
            this.resubscribeToSymbols();
        });
    }

    private async processPendingOperations() {
        if (this.isProcessingQueue || this.pendingOperations.length === 0) {
            return;
        }

        this.isProcessingQueue = true;
        try {
            while (this.pendingOperations.length > 0 && this.connectionState === signalR.HubConnectionState.Connected) {
                const operation = this.pendingOperations.shift();
                if (operation) {
                    try {
                        await operation();
                    } catch (err) {
                        console.error('Error processing pending operation:', err);
                    }
                }
            }
        } finally {
            this.isProcessingQueue = false;
        }
    }

    private queueOperation(operation: PendingOperation) {
        this.pendingOperations.push(operation);
        if (this.connectionState === signalR.HubConnectionState.Connected) {
            this.processPendingOperations();
        }
    }

    private handleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.start();
        }, 5000);
    }

    private async resubscribeToSymbols() {
        const symbols = Array.from(this.subscribedSymbols);
        console.log('Resubscribing to symbols:', symbols);
        for (const symbol of symbols) {
            this.queueOperation(async () => {
                try {
                    await this.connection?.invoke('SubscribeToSymbol', symbol);
                    console.log('Resubscribed to symbol:', symbol);
                } catch (err) {
                    console.error('Error resubscribing to symbol:', symbol, err);
                }
            });
        }
    }

    private async ensureConnected(): Promise<void> {
        if (this.connectionState === signalR.HubConnectionState.Connected) {
            return;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.start();
        return this.connectionPromise;
    }

    public async start(): Promise<void> {
        if (this.isConnecting) {
            console.log('Connection already in progress...');
            return;
        }

        if (this.connectionState === signalR.HubConnectionState.Connected) {
            console.log('Already connected to SignalR');
            return;
        }

        this.isConnecting = true;
        this.connectionState = signalR.HubConnectionState.Connecting;

        try {
            console.log('Starting SignalR connection...');
            await this.connection?.start();
            console.log('SignalR Connected successfully');
            this.isConnecting = false;
            this.connectionState = signalR.HubConnectionState.Connected;
            await this.processPendingOperations();
            await this.resubscribeToSymbols();
        } catch (err) {
            console.error('SignalR Connection Error:', err);
            this.isConnecting = false;
            this.connectionPromise = null;
            this.connectionState = signalR.HubConnectionState.Disconnected;
            this.handleReconnect();
            throw err;
        }
    }

    public async subscribeToSymbol(symbol: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.queueOperation(async () => {
                try {
                    if (!this.subscribedSymbols.has(symbol)) {
                        console.log('Subscribing to symbol:', symbol);
                        await this.connection?.invoke('SubscribeToSymbol', symbol);
                        this.subscribedSymbols.add(symbol);
                    }
                    resolve();
                } catch (err) {
                    console.error('Error subscribing to symbol:', err);
                    reject(err);
                }
            });
        });
    }

    public async unsubscribeFromSymbol(symbol: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.queueOperation(async () => {
                try {
                    if (this.subscribedSymbols.has(symbol)) {
                        console.log('Unsubscribing from symbol:', symbol);
                        await this.connection?.invoke('UnsubscribeFromSymbol', symbol);
                        this.subscribedSymbols.delete(symbol);
                    }
                    resolve();
                } catch (err) {
                    console.error('Error unsubscribing from symbol:', err);
                    reject(err);
                }
            });
        });
    }

    public onOrderBookUpdate(callback: (data: any) => void): void {
        this.orderBookCallbacks.push(callback);
    }

    public onTradeUpdate(callback: (data: any) => void): void {
        this.tradeCallbacks.push(callback);
    }

    public removeOrderBookCallback(callback: (data: any) => void): void {
        this.orderBookCallbacks = this.orderBookCallbacks.filter(cb => cb !== callback);
    }

    public removeTradeCallback(callback: (data: any) => void): void {
        this.tradeCallbacks = this.tradeCallbacks.filter(cb => cb !== callback);
    }

    public getConnectionState(): signalR.HubConnectionState {
        return this.connectionState;
    }
}

export const signalRService = new SignalRService(); 