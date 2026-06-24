const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/novel_tools.test.ts',
  'tests/native_bridge_integration.test.ts',
  'tests/performance.test.ts'
];

console.log('=== 开始运行 AIGC-NetNov 测试套件 ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  console.log(`\n正在运行: ${testFile}`);
  console.log('='.repeat(60));
  
  try {
    const output = execSync(`node --test ${testFile}`, {
      cwd: path.join(__dirname),
      encoding: 'utf8',
      timeout: 60000
    });
    
    console.log(output);
    
    // 简单统计（实际应该解析输出）
    if (output.includes('pass')) {
      passedTests++;
    }
    
  } catch (error) {
    console.error(`测试失败: ${testFile}`);
    console.error(error.stdout || error.message);
    failedTests++;
  }
}

console.log('\n=== 测试执行完成 ===');
console.log(`总测试文件: ${testFiles.length}`);
console.log(`通过: ${passedTests}`);
console.log(`失败: ${failedTests}`);
