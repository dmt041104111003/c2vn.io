import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "~/lib/prisma"
import { CardanoWalletProvider } from "~/lib/cardano-auth-provider"
import { generateWalletAvatar } from '~/lib/wallet-avatar';
import cloudinary from '~/lib/cloudinary';
import { isValidAvatarUrl, validateBase64Image } from '~/lib/avatar-validator';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { isDeviceBanned } from '~/lib/device-attempt-utils';

const roleCache = new Map<string, any>();

interface TokenWithAddress extends Record<string, unknown> {
  address?: string;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CardanoWalletProvider(),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    async redirect({ baseUrl }: { baseUrl: string }) {
      return baseUrl
    },
    async signIn({ user, account, profile, request }) {
      try {
        const userAgent = request?.headers?.get('user-agent') || '';
        const deviceData = {
          userAgent,
          acceptLanguage: request?.headers?.get('accept-language') || '',
          acceptEncoding: request?.headers?.get('accept-encoding') || '',
          platform: request?.headers?.get('sec-ch-ua-platform') || '',
          screenResolution: request?.headers?.get('sec-ch-ua') || ''
        };

        const deviceFingerprint = await generateDeviceFingerprint(userAgent, deviceData);
        const banned = await isDeviceBanned(deviceFingerprint);

        if (banned) {
          return false;
        }

        if (user) {
          (user as any).deviceData = deviceData;
        }

        return true;
      } catch (error) {
        return true; 
      }
    },
    async jwt(params: unknown) {
      const { token, user, account } = params as {
        token: Record<string, unknown>;
        user?: { address?: string; email?: string; image?: string; name?: string; deviceData?: any };
        account?: { provider?: string };
      };
      if (user && account?.provider === "cardano-wallet") {
        (token as TokenWithAddress).address = user.address;
      }
      if (user && account?.provider === "google") {
        token.email = user.email;
        token.provider = "google";
        token.image = user.image;
        token.name = user.name;
      }
      if (user && account?.provider === "github") {
        token.email = user.email;
        token.provider = "github";
        token.image = user.image;
        token.name = user.name;
      }
      
      if (user?.deviceData) {
        token.deviceData = user.deviceData;
      }
      
      return token;
    },
    async session(params: unknown) {
      const { session, token } = params as { session: import("next-auth").Session & { expires?: string }; token: Record<string, unknown> };
      
      try {
        const deviceData = (token as any).deviceData;
        
        if (deviceData) {
          const deviceFingerprint = generateDeviceFingerprint(deviceData.userAgent, deviceData);
          const banned = await isDeviceBanned(deviceFingerprint);

          if (banned) {
            return null;
          }
        }
      } catch (error) {

      }
      
      if (typeof session.user === 'object' && session.user) {
        (session.user as Record<string, unknown> & { address?: string }).address = (token as TokenWithAddress).address;
        if (token.provider === "google" || token.provider === "github") {
          (session.user as Record<string, unknown> & { email?: string }).email = token.email as string;

          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email as string },
              select: { image: true, name: true }
            });
            
            if (dbUser && dbUser.image) {
              session.user.image = dbUser.image;
            } else {
              session.user.image = token.image as string;
            }
            
            session.user.name = dbUser?.name || token.name as string;
          } catch (error) {
            session.user.image = token.image as string;
            session.user.name = token.name as string;
          }
        }
      }
      if (!session.expires) {
        session.expires = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 1 ngày
      }
      return { ...session, expires: session.expires! };
    },
    async signIn(params: unknown) {
      const { user, account } = params as {
        user: { address?: string; email?: string; name?: string; image?: string };
        account: { provider?: string };
      };
      
      if (account?.provider === "google") {
        try {
          let retries = 3;
          while (retries > 0) {
            try {
              await prisma.$connect();
              break;
            } catch (connectError) {
              retries--;
              if (retries === 0) {
                return true;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, name: true, image: true, roleId: true, email: true }
          });

          if (!dbUser) {
		let userRole = roleCache.get("USER");
		if (!userRole) {
		  userRole = await prisma.role.findFirst({
		    where: { name: "USER" },
		    select: { id: true }
		  });
		  if (userRole) {
 		   roleCache.set("USER", userRole);
 		 }
		}

		if (!userRole) {
 		 throw new Error("Role USER not exist");
		}


            let avatar: string | null = user.image || null;
            if (avatar && isValidAvatarUrl(avatar)) {
              try {
                const uploadRes = await cloudinary.uploader.upload(avatar, { 
                  resource_type: 'image',
                  folder: 'google-avatars',
                  transformation: [
                    { width: 400, height: 400, crop: 'fill', quality: 'auto' }
                  ]
                });
                avatar = uploadRes.url;
              } catch (uploadError) {
                avatar = null;
              }
            } else if (avatar) {
              avatar = null;
            }

            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                image: avatar,
                provider: "google",
                roleId: userRole.id,
              },
              select: { id: true, name: true, image: true, roleId: true, email: true }
            });
            
          } else {
            
            if (dbUser.image !== user.image || (dbUser.name !== user.name && !dbUser.name)) {
              let avatar: string | null = user.image || dbUser.image;
              if (user.image && user.image.startsWith('https://lh3.googleusercontent.com') && user.image !== dbUser.image) {
                try {
                  const uploadRes = await cloudinary.uploader.upload(user.image, { 
                    resource_type: 'image',
                    folder: 'google-avatars'
                  });
                  avatar = uploadRes.url;
                } catch (uploadError) {
                  avatar = user.image;
                }
              }
              
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  name: dbUser.name || user.name, 
                  image: avatar,
                }
              });
            }
          }
          
          return true;
        } catch (e) {
          
          if (e instanceof Error && e.message.includes("Can't reach database server")) {
            return false; 
          }
          
          return false;
        }
      }
      
      if (account?.provider === "github") {
        try {
          let retries = 3;
          while (retries > 0) {
            try {
              await prisma.$connect();
              break;
            } catch (connectError) {
              retries--;
              if (retries === 0) {
                return true;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, name: true, image: true, roleId: true, email: true }
          });

          if (!dbUser) {
		let userRole = roleCache.get("USER");
		if (!userRole) {
		  userRole = await prisma.role.findFirst({
		    where: { name: "USER" },
		    select: { id: true }
		  });
		  if (userRole) {
 		   roleCache.set("USER", userRole);
 		 }
		}

		if (!userRole) {
		  throw new Error("Role USER not exist");
		}


            let avatar: string | null = user.image || null;
            if (avatar && isValidAvatarUrl(avatar)) {
              try {
                const uploadRes = await cloudinary.uploader.upload(avatar, {
                  resource_type: 'image',
                  folder: 'github-avatars',
                  transformation: [
                    { width: 400, height: 400, crop: 'fill', quality: 'auto' }
                  ]
                });
                avatar = uploadRes.url;
              } catch (uploadError) {
                avatar = null; 
              }
            } else if (avatar) {
              avatar = null;
            }

            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                image: avatar,
                provider: "github",
                roleId: userRole.id,
              },
              select: { id: true, name: true, image: true, roleId: true, email: true }
            });
          } else {
            if (dbUser.image !== user.image || (dbUser.name !== user.name && !dbUser.name)) {
              let avatar: string | null = user.image || dbUser.image;
              if (user.image && user.image.startsWith('https://avatars.githubusercontent.com') && user.image !== dbUser.image) {
                try {
                  const uploadRes = await cloudinary.uploader.upload(user.image, {
                    resource_type: 'image',
                    folder: 'github-avatars'
                  });
                  avatar = uploadRes.url;
                } catch (uploadError) {
                  avatar = user.image;
                }
              }
              
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  name: dbUser.name || user.name, 
                  image: avatar,
                }
              });
            }
          }
          
          return true;
        } catch (e) {
          console.error('GitHub sign-in failed:', e);
          
          // ❌ KHÔNG return true khi DB unreachable - bảo mật hơn
          if (e instanceof Error && e.message.includes("Can't reach database server")) {
            console.error('Database unreachable during GitHub sign-in');
            return false; // Reject sign-in if DB is down
          }
          
          return false;
        }
      }
      
      
      if (account?.provider === "cardano-wallet") {
        try {
          let retries = 3;
          while (retries > 0) {
            try {
              await prisma.$connect();
              break;
            } catch (connectError) {
              retries--;
              if (retries === 0) {
                return true;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          let dbUser = await prisma.user.findUnique({
            where: { wallet: user.address },
            select: { id: true, name: true, image: true, roleId: true, wallet: true }
          });

          if (!dbUser) {
		let userRole = roleCache.get("USER");
		if (!userRole) {
		  userRole = await prisma.role.findFirst({
		    where: { name: "USER" },
		    select: { id: true }
		  });
 		 if (userRole) {
		    roleCache.set("USER", userRole);
		  }
		}

		if (!userRole) {
		  throw new Error("Role USER not exist");
		}


            let avatar: string | null = user.image || null;
            if (!avatar && user.address) {
              const dataImage = generateWalletAvatar(user.address);
              const uploadRes = await cloudinary.uploader.upload(dataImage, { resource_type: 'image' });
              avatar = uploadRes.url;
            } else if (avatar && avatar.startsWith('data:image')) {
              const uploadRes = await cloudinary.uploader.upload(avatar, { resource_type: 'image' });
              avatar = uploadRes.url;
            }

            dbUser = await prisma.user.create({
              data: {
                wallet: user.address,
                name: user.name || null,
                image: avatar,
                roleId: userRole.id,
              },
              select: { id: true, name: true, image: true, roleId: true, wallet: true }
            });
            
          } else {
            if (dbUser && !dbUser.image && dbUser.wallet) {
              const dataImage = generateWalletAvatar(dbUser.wallet);
              const uploadRes = await cloudinary.uploader.upload(dataImage, { resource_type: 'image' });
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { image: uploadRes.url },
              });
            } else if (dbUser && dbUser.image && dbUser.image.startsWith('data:image')) {
              const uploadRes = await cloudinary.uploader.upload(dbUser.image, { resource_type: 'image' });
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { image: uploadRes.url },
              });
            }
          }
          
          return true;
        } catch (e) {
          
          if (e instanceof Error && e.message.includes("Can't reach database server")) {
            return false;
          }
          
          return false;
        }
      }
      return true;
    },
    async signOut() {
      return true;
    },
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };