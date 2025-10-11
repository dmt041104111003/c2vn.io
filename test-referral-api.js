const testReferralCode = async () => {
  const referralCode = 'C2VNmi2v2nq';
  const sessionToken = '';

  try {
    console.log('Testing referral code validation...');
    console.log('Referral Code:', referralCode);
    console.log('Session Token:', sessionToken.substring(0, 50) + '...');

    const response = await fetch('http://localhost:3000/api/referral/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`
      },
      body: JSON.stringify({
        referralCode: referralCode
      })
    });

    const result = await response.json();
    
    console.log('\n=== API Response ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\nReferral code is VALID');
      console.log('Message:', result.message);
      if (result.data) {
        console.log('Data:', result.data);
      }
    } else {
      console.log('\nReferral code is INVALID');
      console.log('Error:', result.message);
      console.log('Code:', result.code);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
};

testReferralCode();
