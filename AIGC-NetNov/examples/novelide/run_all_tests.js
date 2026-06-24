#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testFiles = [
  'tests/novel_tools.test.ts',
  'tests/native_bridge_integration.test.ts',
  'tests/performance.test.ts'
];

const results = {
  timestamp: new Date().toISOString(),
  totalFiles: testFiles.length,
  results: []
};

console.log('========================================');
console.log('AIGC-NetNov 测试执行日志');
console.log('执行时间:', results.timestamp);
console.log('========================================\n');

for (const testFile of testFiles) {
  const fileName = path.basename(testFile);
  console.log(`\n[${new Date().toLocaleTimeString()}] 开始执行: ${fileName}`);
  console.log('-'.repeat(60));
  
  let startTime, endTime, duration;
  
  try {
    startTime = Date.now();
    const output = execSync(`npx tsx --test ${testFile}`, {
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    endTime = Date.now();
    duration = endTime - startTime;
    
    // 解析输出
    const lines = output.split('\n');
    const summary = {
      tests: 0,
      pass: 0,
      fail: 0,
      skip: 0,
      todo: 0
    };
    
    for (const line of lines) {
      if (line.includes('tests')) {
        const match = line.match(/tests\s+(\d+)/);
        if (match) summary.tests = parseInt(match[1]);
      }
      if (line.includes('pass')) {
        const match = line.match(/pass\s+(\d+)/);
        if (match) summary.pass = parseInt(match[1]);
      }
      if (line.includes('fail')) {
        const match = line.match(/fail\s+(\d+)/);
        if (match) summary.fail = parseInt(match[1]);
      }
    }
    
    console.log(output);
    console.log(`\n[${new Date().toLocaleTimeString()}] 完成: ${fileName} (耗时: ${duration}ms)`);
    console.log(`  测试: ${summary.tests}, 通过: ${summary.pass}, 失败: ${summary.fail}`);
    
    results.results.push({
      file: testFile,
      status: 'success',
      duration,
      summary,
      output: output.substring(0, 5000) // 限制输出长度
    });
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`\n[${new Date().toLocaleTimeString()}] 失败: ${fileName}`);
    console.error('错误输出:');
    if (error.stdout) console.error(error.stdout.substring(0, 2000));
    if (error.stderr) console.error(error.stderr.substring(0, 2000));
    
    results.results.push({
      file: testFile,
      status: 'error',
      duration,
      error: error.message.substring(0, 1000)
    });
  }
}

// 保存结果到JSON
const resultFile = path.join(__dirname, `test_results_${Date.now()}.json`);
fs.writeFileSync(resultFile, JSON.stringify(results, null, 2), 'utf8');
console.log('\n========================================');
console.log('测试执行完成');
console.log('结果已保存到:', resultFile);
console.log('========================================');

// 输出汇总
console.log('\n=== 测试汇总 ===');
let totalTests = 0;
let totalPass = 0;
let totalFail = 0;
for (const result of results.results) {
  if (result.summary) {
    totalTests += result.summary.tests;
    totalPass += result.summary.pass;
    totalFail += result.summary.fail;
  }
}
console.log(`总测试文件: ${results.totalFiles}`);
console.log(`总测试用例: ${totalTests}`);
console.log(`通过: ${totalPass}`);
console.log(`失败: ${totalFail}`);
console.log(`成功率: ${totalTests > 0 ? ((totalPass / totalTests) * 100).toFixed(2) : 0}%`);
