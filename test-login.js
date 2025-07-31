// Test login functionality
const puppeteer = require('puppeteer');

async function testLogin() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('1. Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Check if we're on the login page
    const loginPageText = await page.evaluate(() => document.body.innerText);
    console.log('2. Page loaded. Checking for login form...');
    
    if (loginPageText.includes('Welcome to AI Chat')) {
      console.log('✓ Login page detected');
      
      // Test 1: Invalid credentials
      console.log('\n3. Testing invalid credentials...');
      await page.type('input[id="username"]', 'wronguser');
      await page.type('input[id="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      const errorText = await page.evaluate(() => document.body.innerText);
      if (errorText.includes('Invalid username or password')) {
        console.log('✓ Error message displayed for invalid credentials');
      }
      
      // Clear inputs
      await page.evaluate(() => {
        document.querySelector('input[id="username"]').value = '';
        document.querySelector('input[id="password"]').value = '';
      });
      
      // Test 2: Valid credentials
      console.log('\n4. Testing valid credentials...');
      await page.type('input[id="username"]', 'admin321');
      await page.type('input[id="password"]', 'erabot2025');
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Check if we're logged in
      const loggedInText = await page.evaluate(() => document.body.innerText);
      if (loggedInText.includes('AI Chat Assistant') || loggedInText.includes('Start a conversation')) {
        console.log('✓ Successfully logged in!');
        
        // Check for logout button
        const hasLogoutButton = await page.evaluate(() => {
          return !!document.querySelector('button[aria-label="Logout"]');
        });
        
        if (hasLogoutButton) {
          console.log('✓ Logout button present');
        }
      }
      
      // Test 3: Check session persistence
      console.log('\n5. Testing session persistence...');
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);
      
      const afterReloadText = await page.evaluate(() => document.body.innerText);
      if (!afterReloadText.includes('Welcome to AI Chat')) {
        console.log('✓ Session persisted after reload');
      }
      
      // Test 4: Logout
      console.log('\n6. Testing logout...');
      const logoutButton = await page.$('button[aria-label="Logout"]');
      if (logoutButton) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        const afterLogoutText = await page.evaluate(() => document.body.innerText);
        if (afterLogoutText.includes('Welcome to AI Chat')) {
          console.log('✓ Successfully logged out');
        }
      }
      
    } else {
      console.log('✗ Login page not found. Current page content:');
      console.log(loginPageText.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed!');
  }
}

// Run the test
testLogin().catch(console.error);