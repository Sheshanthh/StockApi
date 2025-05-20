import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private static instance: SignalRService;

    private constructor() {}

    public static getInstance(): SignalRService {
        if (!SignalRService.instance) {
            SignalRService.instance = new SignalRService();
        }
        return SignalRService.instance;
    }

    public async startConnection(): Promise<void> {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('https://localhost:7001/stockHub') // Update this URL to match your backend
                .withAutomaticReconnect()
                .build();

            await this.connection.start();
            console.log('SignalR Connected!');
        } catch (err) {
            console.error('Error while establishing connection:', err);
        }
    }

    public async stopConnection(): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.stop();
                console.log('SignalR Disconnected!');
            }
        } catch (err) {
            console.error('Error while stopping connection:', err);
        }
    }

    public onPriceUpdate(callback: (symbol: string, price: number) => void): void {
        if (this.connection) {
            this.connection.on('ReceivePriceUpdate', callback);
        }
    }

    public onStockListUpdate(callback: (stocks: string[]) => void): void {
        if (this.connection) {
            this.connection.on('ReceiveStockList', callback);
        }
    }
}

export default SignalRService; 