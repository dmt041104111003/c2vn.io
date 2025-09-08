const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateReferralCodes() {
  try {
    console.log('Starting referral code generation for existing users...');

    // Lấy tất cả user chưa có mã giới thiệu
    const usersWithoutCodes = await prisma.user.findMany({
      where: {
        referralCode: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true
      }
    });

    console.log(`Found ${usersWithoutCodes.length} users without referral codes`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutCodes) {
      try {
        // Tạo mã giới thiệu dựa trên ID
        const last7Chars = user.id.slice(-7);
        let referralCode = `C2VN${last7Chars}`;
        
        // Kiểm tra xem mã có trùng không
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const existing = await prisma.user.findUnique({
            where: { referralCode }
          });

          if (!existing) {
            break;
          }

          // Nếu mã đã tồn tại, tạo lại với một phần ngẫu nhiên
          const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
          referralCode = `C2VN${user.id.slice(-4)}${randomSuffix}`;
          attempts++;
        }

        // Fallback: tạo mã hoàn toàn ngẫu nhiên
        if (attempts >= maxAttempts) {
          const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
          referralCode = `C2VN${randomSuffix}`;
        }

        // Cập nhật user với mã giới thiệu
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode }
        });

        console.log(`✓ Generated code ${referralCode} for user ${user.name || user.email || user.wallet || user.id}`);
        successCount++;

      } catch (error) {
        console.error(`✗ Failed to generate code for user ${user.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nGeneration completed:`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error during referral code generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
generateReferralCodes();
