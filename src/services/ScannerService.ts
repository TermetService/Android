// src/services/ScannerService.ts
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScannerModule } = NativeModules;

class ScannerService {
  private static instance: ScannerService;
  private isScanning: boolean = false;
  private eventEmitter: NativeEventEmitter | null = null;
  private scanListeners: Set<(data: string) => void> = new Set();

  private constructor() {
    if (Platform.OS === 'android') {
      this.eventEmitter = new NativeEventEmitter(NativeModules.ScannerModule);
      this.setupEventListeners();
    }
  }

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  private setupEventListeners() {
    if (this.eventEmitter) {
      this.eventEmitter.addListener('onScanData', (event: any) => {
        console.log('📊 Scan data received:', event);
        const scanData = event?.data || event;
        this.notifyListeners(scanData);
      });
    }
  }

  async initSDK(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      console.warn('⚠️ Scanner module not available');
      return false;
    }

    try {
      const result = await ScannerModule.initSDK();
      console.log('✅ SDK initialized:', result);
      return result;
    } catch (error) {
      console.error('❌ Error initializing SDK:', error);
      return false;
    }
  }

  async startScan(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      console.warn('⚠️ Scanner module not available');
      return false;
    }

    try {
      console.log('📡 Starting scan via SDK...');
      const result = await ScannerModule.startScan();
      this.isScanning = result;
      console.log('✅ Scan started:', result);
      return result;
    } catch (error) {
      console.error('❌ Error starting scan:', error);
      return false;
    }
  }

  async stopScan(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      return false;
    }

    try {
      const result = await ScannerModule.stopScan();
      this.isScanning = false;
      console.log('✅ Scan stopped:', result);
      return result;
    } catch (error) {
      console.error('❌ Error stopping scan:', error);
      return false;
    }
  }

  async deinitSDK(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      return false;
    }

    try {
      return await ScannerModule.deinitSDK();
    } catch (error) {
      console.error('❌ Error deinitializing SDK:', error);
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      return false;
    }

    try {
      return await ScannerModule.isScannerAvailable();
    } catch (error) {
      console.error('❌ Error checking scanner:', error);
      return false;
    }
  }

  async setScanMode(mode: 'SINGLE_SCAN' | 'REPEAT_SCAN'): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      return false;
    }

    try {
      return await ScannerModule.setScanMode(mode);
    } catch (error) {
      console.error('❌ Error setting scan mode:', error);
      return false;
    }
  }

  async setTimeout(seconds: number): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScannerModule) {
      return false;
    }

    try {
      return await ScannerModule.setTimeout(seconds);
    } catch (error) {
      console.error('❌ Error setting timeout:', error);
      return false;
    }
  }

  isActive(): boolean {
    return this.isScanning;
  }

  addScanListener(listener: (data: string) => void) {
    this.scanListeners.add(listener);
  }

  removeScanListener(listener: (data: string) => void) {
    this.scanListeners.delete(listener);
  }

  private notifyListeners(data: string) {
    this.scanListeners.forEach(listener => listener(data));
  }
}

export const scannerService = ScannerService.getInstance();
