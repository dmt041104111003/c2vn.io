
export function getRealIPViaWebRTC(): Promise<string> {
  return new Promise((resolve, reject) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    });

    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));

    const foundIPs: string[] = [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (ipMatch) {
          const ip = ipMatch[1];
          foundIPs.push(ip);
          
          if (!isPrivateIP(ip)) {
            pc.close();
            resolve(ip);
            return;
          }
        }
      }
    };

    setTimeout(() => {
      pc.close();
      if (foundIPs.length > 0) {
        const publicIP = foundIPs.find(ip => !isPrivateIP(ip));
        if (publicIP) {
          resolve(publicIP);
        } else {
          reject(new Error('No public IP found'));
        }
      } else {
        reject(new Error('Cannot get IP address'));
      }
    }, 3000);
  });
}

export async function getIPFromExternalService(): Promise<string> {
  const services = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://ipinfo.io/json',
    'https://api.myip.com',
    'https://ip-api.com/json/'
  ];

  for (const service of services) {
    try {
      const response = await fetch(service, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        const ip = data.ip || data.query;
        if (ip && !isPrivateIP(ip)) {
          return ip;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('All external services failed');
}

export async function getRealIP(): Promise<string> {
  try {
    return await getRealIPViaWebRTC();
  } catch (webrtcError) {
    try {
      return await getIPFromExternalService();
    } catch (externalError) {
      throw new Error('Cannot get IP address from any method');
    }
  }
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
  );
}
