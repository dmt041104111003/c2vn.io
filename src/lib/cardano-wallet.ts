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
  private rawWallet: any | null = null;
  private user: CardanoWalletUser | null = null;
  private currentWalletName: string = '';

  constructor(config: CardanoWalletConfig) {
    this.config = config;
  }

  async connect(walletName: string = 'eternl'): Promise<CardanoWalletUser> {
    try {
      const candidateNames = (WALLET_ALIASES[walletName] || [walletName]).map(n => n.toLowerCase());
      const injected = typeof window !== 'undefined' ? (window as any).cardano : null;
      if (injected && typeof injected === 'object') {
        const injectedKeys: string[] = Object.keys(injected);
        const matchedInjectedKey = injectedKeys.find(key => candidateNames.includes(key.toLowerCase()));
        if (matchedInjectedKey) {
          const provider = injected[matchedInjectedKey];
          if (!provider || typeof provider.enable !== 'function') {
            throw new Error(`Wallet ${matchedInjectedKey} does not support CIP-30 enable()`);
          }
          const api = await provider.enable();
          this.wallet = null;
          this.rawWallet = api;
          this.currentWalletName = matchedInjectedKey;

          let address: string = '';
          try {
            if (this.rawWallet?.getRewardAddresses) {
              const rewards = await this.rawWallet.getRewardAddresses();
              if (Array.isArray(rewards) && rewards.length > 0) {
                address = rewards[0];
              }
            }
            if (!address && this.rawWallet?.getUnusedAddresses) {
              const unused = await this.rawWallet.getUnusedAddresses();
              if (Array.isArray(unused) && unused.length > 0) {
                address = unused[0];
              }
            }
            if (!address && this.rawWallet?.getChangeAddress) {
              address = await this.rawWallet.getChangeAddress();
            }
          } catch {}

          this.user = {
            address,
            name: matchedInjectedKey,
            image: provider.icon || ''
          };

          return this.user;
        }
      }

      const availableWallets = await BrowserWallet.getAvailableWallets();
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

      this.rawWallet = null;
      this.wallet = await BrowserWallet.enable(selectedName);
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
    this.rawWallet = null;
    this.user = null;
    this.currentWalletName = '';
  }

  async signMessage(message: string): Promise<string> {
    if ((!this.wallet && !this.rawWallet) || !this.user) {
      throw new Error('Wallet not connected');
    }

    try {
      const toHex = (str: string): string =>
        Array.from(new TextEncoder().encode(str))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      const payloadHex = toHex(message);

      if (this.wallet) {
        let signAddress = this.user.address;
        if (!signAddress || !signAddress.startsWith('addr')) {
          signAddress = await this.wallet.getChangeAddress();
        }
        const signature = await this.wallet.signData(signAddress, payloadHex);
        return (signature as any)?.signature || (signature as any)?.sig || (signature as any);
      }

      let addrHex = this.user.address;
      if (!addrHex) {
        throw new Error('No address available for signing');
      }
      if (addrHex.startsWith('addr')) {
        addrHex = await this.rawWallet!.getChangeAddress();
      }
      const result = await this.rawWallet!.signData(addrHex, payloadHex);
      return (result as any)?.signature || (result as any)?.sig || (result as any);
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
    return this.wallet !== null || this.rawWallet !== null;
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