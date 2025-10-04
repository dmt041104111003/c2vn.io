export function isMainnetAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  return address.startsWith('addr1') || 
         (address.startsWith('addr') && !address.startsWith('addr_test'));
}

export function isTestnetAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  return address.startsWith('addr_test');
}

export function isValidCardanoAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  return address.startsWith('addr');
}

export function getCardanoNetworkType(address: string): 'mainnet' | 'testnet' | 'unknown' {
  if (isMainnetAddress(address)) {
    return 'mainnet';
  }
  
  if (isTestnetAddress(address)) {
    return 'testnet';
  }
  
  return 'unknown';
}
