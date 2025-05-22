import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private orderBookCallbacks: ((data: any) => void)[] = [];
    private tradeCallbacks: ((data: any) => void)[] = [];
    private isConnecting: boolean = false;

    constructor() {
        this.initializeConnection();
    }

    private initializeConnection() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/hubs/stock')  // Changed to http and port 5000
            .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry intervals
            .configureLogging(signalR.LogLevel.Debug) // Enable detailed logging
            .build();

        this.connection.on('OrderBookUpdate', (data) => {
            this.orderBookCallbacks.forEach(callback => callback(data));
        });

        this.connection.on('TradeUpdate', (data) => {
            this.tradeCallbacks.forEach(callback => callback(data));
        });

        // Add connection state change logging
        this.connection.onclose((error) => {
            console.log('SignalR Connection Closed:', error);
            this.isConnecting = false;
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR Reconnecting:', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR Reconnected:', connectionId);
            this.isConnecting = false;
        });
    }

    public async start(): Promise<void> {
        if (this.isConnecting) {
            console.log('Connection already in progress...');
            return;
        }

        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('Already connected to SignalR');
            return;
        }

        this.isConnecting = true;
        try {
            console.log('Starting SignalR connection...');
            await this.connection?.start();
            console.log('SignalR Connected successfully');
            this.isConnecting = false;
        } catch (err) {
            console.error('SignalR Connection Error:', err);
            this.isConnecting = false;
            // Wait 5 seconds before retrying
            setTimeout(() => this.start(), 5000);
        }
    }

    public async subscribeToSymbol(symbol: string): Promise<void> {
        try {
            if (this.connection?.state !== signalR.HubConnectionState.Connected) {
                console.log('Not connected to SignalR, attempting to connect...');
                await this.start();
            }
            console.log('Subscribing to symbol:', symbol);
            await this.connection?.invoke('SubscribeToSymbol', symbol);
        } catch (err) {
            console.error('Error subscribing to symbol:', err);
        }
    }

    public async unsubscribeFromSymbol(symbol: string): Promise<void> {
        try {
            if (this.connection?.state === signalR.HubConnectionState.Connected) {
                console.log('Unsubscribing from symbol:', symbol);
                await this.connection?.invoke('UnsubscribeFromSymbol', symbol);
            }
        } catch (err) {
            console.error('Error unsubscribing from symbol:', err);
        }
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
}

export const signalRService = new SignalRService(); 