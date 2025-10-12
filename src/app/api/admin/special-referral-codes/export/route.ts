import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createErrorResponse } from '~/lib/api-response';
import * as XLSX from 'xlsx';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const specialCodes = await prisma.specialReferralCode.findMany({
      include: {
        referralSubmissions: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            wallet: true,
            course: true,
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const creatorIds = [...new Set(specialCodes.map(code => code.createdBy))];
    const creators = await prisma.user.findMany({
      where: {
        id: { in: creatorIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const creatorMap = new Map(creators.map(creator => [creator.id, creator]));

    const workbook = XLSX.utils.book_new();

    const summaryData = specialCodes.map(code => {
      const creator = creatorMap.get(code.createdBy);
      return {
        'Code': code.code,
        'Code Name': code.name || '',
        'Code Email': code.email || '',
        'Status': code.isActive ? 'Active' : 'Inactive',
        'Created At': new Date(code.createdAt).toLocaleString('vi-VN'),
        'Expires At': code.expiresAt ? new Date(code.expiresAt).toLocaleString('vi-VN') : 'Never',
        'Created By': creator?.name || 'Unknown',
        'Creator Email': creator?.email || '',
        'Total Submissions': code.referralSubmissions.length
      };
    });

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const allSubmissions = specialCodes.flatMap(code => 
      code.referralSubmissions.map(sub => ({
        'Special Code': code.code,
        'Code Name': code.name || '',
        'Code Email': code.email || '',
        'Code Status': code.isActive ? 'Active' : 'Inactive',
        'Submission ID': sub.id,
        'Name': sub.name,
        'Email': sub.email,
        'Phone': sub.phone || '',
        'Wallet': sub.wallet || '',
        'Course': sub.course || '',
        'Message': sub.message || '',
        'Submitted At': new Date(sub.createdAt).toLocaleString('vi-VN')
      }))
    );

    const submissionsSheet = XLSX.utils.json_to_sheet(allSubmissions);
    XLSX.utils.book_append_sheet(workbook, submissionsSheet, 'All Submissions');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="special-referral-codes-${new Date().toISOString().split('T')[0]}.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to export data', 'EXPORT_ERROR'), { status: 500 });
  }
});
