const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/page.tsx',
  'src/app/history/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/scanner/page.tsx',
  'src/lib/AuthContext.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'frontend', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Quick regex to identify URLs and replace them safely.
  // 1. Where localhost is inside process.env fallback logic
  content = content.replace(/'http:\/\/localhost:8000\/api'/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api`');

  // 2. AuthContext API_URL
  content = content.replace(/'http:\/\/localhost:8000\/api\/auth'/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/auth`');

  // 3. updateMe
  content = content.replace(/'http:\/\/localhost:8000\/api\/users\/updateMe'/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/users/updateMe`');

  // 4. uploadProfilePhoto
  content = content.replace(/'http:\/\/localhost:8000\/api\/users\/uploadProfilePhoto'/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/users/uploadProfilePhoto`');

  // 5. deleteProfilePhoto
  content = content.replace(/'http:\/\/localhost:8000\/api\/users\/deleteProfilePhoto'/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/users/deleteProfilePhoto`');

  // 6. scanner API_URL
  content = content.replace(/"http:\/\/localhost:8000\/api\/detection\/detect"/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/detection/detect`');

  // 7. Data fileUrl
  content = content.replace(/`http:\/\/localhost:8000\$\{data\.data\.fileUrl\}`/g, '`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000${data.data.fileUrl}`');

  fs.writeFileSync(filePath, content);
});

console.log('done replacing');
