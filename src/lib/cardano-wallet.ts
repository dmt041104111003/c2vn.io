import { BrowserWallet } from '@meshsdk/core';
import { CardanoWalletUser, CardanoWalletConfig } from '~/constants/wallet';

const WALLET_ALIASES: Record<string, string[]> = {
  eternal: ['eternl', 'eternal'],
  eternl: ['eternl', 'eternal'],
  lace: ['lace'],
  yoroi: ['yoroi'],
  nufi: ['nufi', 'NuFi'],
  typhon: ['typhoncip30', 'typhon'],
  gero: ['gerowallet', 'gero'],
};

export class CardanoWalletProvider {
  private config: CardanoWalletConfig;
  private wallet: BrowserWallet | null = null;
  private user: CardanoWalletUser | null = null;
  private currentWalletName: string = '';

  constructor(config: CardanoWalletConfig) {
    this.config = config;
  }

  async connect(walletName: string = 'eternl'): Promise<CardanoWalletUser> {
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();

      const candidateNames = (WALLET_ALIASES[walletName] || [walletName]).map(n => n.toLowerCase());
      const availableLowerNames = availableWallets.map(w => w.name.toLowerCase());
      const matchedLower = candidateNames.find(name => availableLowerNames.includes(name));

      const selectedName = matchedLower
        ? availableWallets.find(w => w.name.toLowerCase() === matchedLower)!.name
        : undefined;

      if (!selectedName) {
        const detected = availableWallets.map(w => w.name).join(', ');
        throw new Error(`Wallet ${walletName} is not installed or not exposing CIP-30. Detected: ${detected || 'none'}.`);
      }

      const walletInfo = availableWallets.find(w => w.name === selectedName)!;

      try {
        this.wallet = await BrowserWallet.enable(selectedName);
      } catch (error) {
        if (typeof window !== 'undefined' && (window as any).cardano && (window as any).cardano[selectedName]) {
          const provider = (window as any).cardano[selectedName];
          if (provider && typeof provider.enable === 'function') {
            const api = await provider.enable();
            this.wallet = await (BrowserWallet as any).fromWallet(api, selectedName);
          } else {
            throw new Error(`Wallet ${selectedName} found but enable() method not available`);
          }
        } else {
          throw error;
        }
      }
      
      this.currentWalletName = selectedName;
      
      if (!this.wallet) {
        throw new Error(`Failed to enable wallet ${selectedName}`);
      }
      
      const addresses = await this.wallet.getUnusedAddresses();
      const address = addresses[0];
      
      this.user = {
        address,
        name: walletInfo.name,
        image: walletInfo.icon
      };

      return this.user;
    } catch (error) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.wallet = null;
    this.user = null;
    this.currentWalletName = '';
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet || !this.user) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.wallet.signData(message);
      return signature.signature;
    } catch (error) {
      throw error;
    }
  }



  async getAvailableWallets(): Promise<Array<{ name: string; icon: string; version: string }>> {
    try {
      return await BrowserWallet.getAvailableWallets();
    } catch (error) {
      return [];
    }
  }

  async isWalletInstalled(walletName?: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (walletName) {
      return this.checkWalletAvailability(walletName);
    }
    
    return true;
  }

  private async checkWalletAvailability(walletName: string): Promise<boolean> {
    const candidateNames = (WALLET_ALIASES[walletName] || [walletName]).map(n => n.toLowerCase());
    
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      return availableWallets.some(wallet => candidateNames.includes(wallet.name.toLowerCase()));
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): CardanoWalletUser | null {
    return this.user;
  }

  getConnectionStatus(): boolean {
    return this.wallet !== null;
  }

  getWallet(): BrowserWallet | null {
    return this.wallet;
  }

  getCurrentWalletName(): string {
    return this.currentWalletName;
  }

  getConfig(): CardanoWalletConfig {
    return this.config;
  }
}

export const WALLET_NAMES = {
  eternal: 'eternl',
  lace: 'lace',
  yoroi: 'yoroi',
  nufi: 'nufi',
  typhon: 'typhoncip30',
  gero: 'gerowallet'
};

export const cardanoWallet = new CardanoWalletProvider({
  network: 'mainnet'
}); 