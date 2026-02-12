# Security Implementation Guide for Secure Idea-to-PRD Claude Code Skill

## Overview

This guide provides step-by-step instructions for implementing the comprehensive security architecture designed for the idea-to-PRD Claude Code skill. It includes code examples, configuration guidelines, and operational procedures.

## Prerequisites

- Node.js 18+ or Python 3.9+
- Claude Code environment
- Access to AIMDS (AI Manipulation Defense System)
- TypeScript/JavaScript development environment

## Implementation Phases

### Phase 1: Core Security Framework Setup

#### 1.1 Install Dependencies

```bash
# For TypeScript implementation
npm install --save crypto path
npm install --save-dev @types/node jest @types/jest

# For Python implementation
pip install cryptography pathlib typing-extensions pydantic
```

#### 1.2 Environment Configuration

Create a `.env.security` file:

```bash
# Security Configuration
SECURITY_LEVEL=strict
ENABLE_AIMDS=true
MAX_FILE_SIZE=10485760
MAX_INPUT_SIZE=1048576
LOG_SECURITY_EVENTS=true
ENABLE_PERFORMANCE_MONITORING=true

# AIMDS Configuration
AIMDS_ENDPOINT=http://localhost:8080/aimds
AIMDS_TIMEOUT_MS=10
AIMDS_API_KEY=your_aimds_api_key

# File System Configuration
BASE_DIRECTORY=/workspaces/jlmaworkspace
ALLOWED_EXTENSIONS=.md,.txt,.json,.pseudo,.feature,.yaml,.yml,.ts,.js,.py
BACKUP_ENABLED=true

# Logging Configuration
LOG_LEVEL=info
SECURITY_LOG_PATH=/var/log/claude-security.log
```

#### 1.3 Initialize Security Validator

```typescript
// security-config.ts
import { SecurityValidator, SecurityLevel } from './security-validation-rules';

export const createSecurityValidator = (): SecurityValidator => {
  return new SecurityValidator({
    level: process.env.SECURITY_LEVEL === 'strict' ? SecurityLevel.STRICT : SecurityLevel.BALANCED,
    maxInputSize: parseInt(process.env.MAX_INPUT_SIZE || '1048576'),
    allowedFileExtensions: (process.env.ALLOWED_EXTENSIONS || '.md,.txt,.json').split(','),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    enableAIMDS: process.env.ENABLE_AIMDS === 'true',
    logSecurityEvents: process.env.LOG_SECURITY_EVENTS === 'true'
  });
};
```

### Phase 2: AIMDS Integration

#### 2.1 AIMDS Client Implementation

```typescript
// aimds-client.ts
interface AIMDSConfig {
  endpoint: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
}

export class AIMDSClient {
  private config: AIMDSConfig;

  constructor(config: AIMDSConfig) {
    this.config = config;
  }

  async scan(input: string, mode: 'quick' | 'thorough' = 'thorough'): Promise<{
    safe: boolean;
    threats: string[];
    confidence: number;
    detectionTimeMs: number;
    piiFound: boolean;
  }> {
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.config.endpoint}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Scan-Mode': mode
        },
        body: JSON.stringify({ input }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`AIMDS API error: ${response.status}`);
      }

      const result = await response.json();
      const detectionTimeMs = performance.now() - startTime;

      return {
        ...result,
        detectionTimeMs
      };
    } catch (error) {
      // Fail secure - assume threat if scanning fails
      return {
        safe: false,
        threats: ['aimds_scan_failure', error.message],
        confidence: 0.0,
        detectionTimeMs: performance.now() - startTime,
        piiFound: false
      };
    }
  }

  async analyzeBehavior(
    agentId: string,
    timeWindow: string = '1h',
    anomalyThreshold: number = 0.8
  ): Promise<{
    normal: boolean;
    anomalyScore: number;
    behaviors: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.config.endpoint}/behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          agentId,
          timeWindow,
          anomalyThreshold
        })
      });

      if (!response.ok) {
        throw new Error(`AIMDS Behavior API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Behavior analysis failed:', error.message);
      return {
        normal: true, // Default to normal if analysis fails
        anomalyScore: 0.0,
        behaviors: [],
        recommendations: []
      };
    }
  }
}

// Initialize AIMDS client
export const aimdsClient = new AIMDSClient({
  endpoint: process.env.AIMDS_ENDPOINT || 'http://localhost:8080/aimds',
  apiKey: process.env.AIMDS_API_KEY || '',
  timeout: parseInt(process.env.AIMDS_TIMEOUT_MS || '10'),
  maxRetries: 3
});
```

#### 2.2 Real-time Threat Detection

```typescript
// threat-detector.ts
import { aimdsClient } from './aimds-client';

export class ThreatDetector {
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  async detectThreats(
    input: string,
    context: string = 'default'
  ): Promise<{
    safe: boolean;
    threats: string[];
    confidence: number;
    cached: boolean;
  }> {
    // Check cache first
    const cacheKey = this.generateCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return { ...cached.result, cached: true };
    }

    // Perform detection
    const result = await aimdsClient.scan(input, 'thorough');

    // Cache result
    this.cache.set(cacheKey, {
      result: { ...result, cached: false },
      timestamp: Date.now()
    });

    // Clean up old cache entries
    this.cleanupCache();

    return { ...result, cached: false };
  }

  private generateCacheKey(input: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const threatDetector = new ThreatDetector();
```

### Phase 3: Secure File Operations

#### 3.1 Atomic File Operations

```typescript
// atomic-file-ops.ts
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';

export class AtomicFileOperations {
  async atomicWrite(
    filepath: string,
    content: string,
    options: { backup?: boolean; verify?: boolean } = {}
  ): Promise<{
    success: boolean;
    hash?: string;
    backupPath?: string;
    error?: string;
  }> {
    const tempPath = `${filepath}.tmp.${Date.now()}.${Math.random().toString(36)}`;
    const contentHash = createHash('sha256').update(content, 'utf8').digest('hex');

    try {
      // Ensure directory exists
      await fs.mkdir(dirname(filepath), { recursive: true });

      // Create backup if requested
      let backupPath: string | undefined;
      if (options.backup) {
        try {
          const existing = await fs.readFile(filepath, 'utf8');
          backupPath = `${filepath}.backup.${new Date().toISOString().replace(/[:.]/g, '-')}`;
          await fs.writeFile(backupPath, existing, 'utf8');
        } catch {
          // File doesn't exist, no backup needed
        }
      }

      // Write to temporary file
      await fs.writeFile(tempPath, content, 'utf8');

      // Verify content if requested
      if (options.verify) {
        const written = await fs.readFile(tempPath, 'utf8');
        const writtenHash = createHash('sha256').update(written, 'utf8').digest('hex');

        if (writtenHash !== contentHash) {
          await fs.unlink(tempPath);
          return {
            success: false,
            error: 'Content verification failed'
          };
        }
      }

      // Atomic move (rename) to final location
      await fs.rename(tempPath, filepath);

      return {
        success: true,
        hash: contentHash,
        backupPath
      };

    } catch (error) {
      // Cleanup temp file on error
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async safeRead(
    filepath: string,
    options: { maxSize?: number; scanContent?: boolean } = {}
  ): Promise<{
    success: boolean;
    content?: string;
    size?: number;
    hash?: string;
    threats?: string[];
    error?: string;
  }> {
    try {
      const stats = await fs.stat(filepath);

      // Check file size
      const maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
      if (stats.size > maxSize) {
        return {
          success: false,
          error: 'File size exceeds limit'
        };
      }

      // Read file
      const content = await fs.readFile(filepath, 'utf8');
      const hash = createHash('sha256').update(content, 'utf8').digest('hex');

      // Scan content if requested
      let threats: string[] = [];
      if (options.scanContent) {
        const scanResult = await threatDetector.detectThreats(content, `file:${filepath}`);
        if (!scanResult.safe) {
          threats = scanResult.threats;
        }
      }

      return {
        success: true,
        content,
        size: stats.size,
        hash,
        threats
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const atomicFileOps = new AtomicFileOperations();
```

### Phase 4: Production Deployment

#### 4.1 Security Monitoring Setup

```typescript
// security-monitor.ts
export class SecurityMonitor {
  private events: Array<{
    timestamp: Date;
    type: string;
    severity: string;
    details: any;
  }> = [];

  async logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    context?: any;
  }): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      ...event
    };

    this.events.push(logEntry);

    // Write to security log file
    if (process.env.SECURITY_LOG_PATH) {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(process.env.SECURITY_LOG_PATH, logLine);
    }

    // Alert on high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.sendAlert(logEntry);
    }

    // Maintain event history (keep last 10000 events)
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  async sendAlert(event: any): Promise<void> {
    // Implement alerting mechanism (email, Slack, PagerDuty, etc.)
    console.error(`[SECURITY ALERT] ${JSON.stringify(event)}`);

    // Example: Send to monitoring service
    // await monitoringService.alert(event);
  }

  getMetrics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: any[];
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents: this.events.slice(-100) // Last 100 events
    };
  }
}

export const securityMonitor = new SecurityMonitor();
```

#### 4.2 Health Checks and Monitoring

```typescript
// health-check.ts
export class SecurityHealthCheck {
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      duration: number;
      details?: any;
    }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check AIMDS connectivity
    const aimdsCheck = await this.checkAIMDS();
    checks.push(aimdsCheck);

    // Check file system permissions
    const fsCheck = await this.checkFileSystem();
    checks.push(fsCheck);

    // Check memory usage
    const memoryCheck = await this.checkMemoryUsage();
    checks.push(memoryCheck);

    // Check performance metrics
    const performanceCheck = await this.checkPerformance();
    checks.push(performanceCheck);

    // Determine overall status
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    if (failedChecks > 0) {
      overallStatus = failedChecks > 1 ? 'unhealthy' : 'degraded';
    }

    return {
      status: overallStatus,
      checks
    };
  }

  private async checkAIMDS(): Promise<any> {
    const start = performance.now();
    try {
      const result = await aimdsClient.scan('health check', 'quick');
      return {
        name: 'aimds_connectivity',
        status: result.safe !== undefined ? 'pass' : 'fail',
        duration: performance.now() - start,
        details: { latency: result.detectionTimeMs }
      };
    } catch (error) {
      return {
        name: 'aimds_connectivity',
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async checkFileSystem(): Promise<any> {
    const start = performance.now();
    try {
      const testPath = join(process.env.BASE_DIRECTORY || '/tmp', '.security-health-check');
      await fs.writeFile(testPath, 'health check');
      await fs.readFile(testPath, 'utf8');
      await fs.unlink(testPath);

      return {
        name: 'filesystem_permissions',
        status: 'pass',
        duration: performance.now() - start
      };
    } catch (error) {
      return {
        name: 'filesystem_permissions',
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async checkMemoryUsage(): Promise<any> {
    const start = performance.now();
    const memUsage = process.memoryUsage();
    const maxMemory = 1024 * 1024 * 1024; // 1GB

    return {
      name: 'memory_usage',
      status: memUsage.heapUsed < maxMemory ? 'pass' : 'fail',
      duration: performance.now() - start,
      details: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        maxMemory
      }
    };
  }

  private async checkPerformance(): Promise<any> {
    const start = performance.now();

    // Perform a sample validation to check performance
    const validator = createSecurityValidator();
    const testStart = performance.now();
    await validator.validateInput('performance test', 'health_check');
    const validationTime = performance.now() - testStart;

    const maxValidationTime = 50; // 50ms threshold

    return {
      name: 'validation_performance',
      status: validationTime < maxValidationTime ? 'pass' : 'fail',
      duration: performance.now() - start,
      details: {
        validationTime,
        maxValidationTime
      }
    };
  }
}

export const healthCheck = new SecurityHealthCheck();
```

### Phase 5: Testing and Validation

#### 5.1 Security Test Runner

```bash
#!/bin/bash
# security-test-runner.sh

echo "=== Running Security Test Suite ==="

# Set test environment
export NODE_ENV=test
export SECURITY_LEVEL=strict
export ENABLE_AIMDS=true

# Run unit tests
echo "Running unit tests..."
npm test -- --testPathPattern=security

# Run integration tests
echo "Running integration tests..."
npm run test:integration

# Run penetration tests
echo "Running penetration tests..."
node scripts/run-penetration-tests.js

# Generate security report
echo "Generating security report..."
node scripts/generate-security-report.js

echo "=== Security Tests Complete ==="
```

#### 5.2 Automated Security Validation

```typescript
// scripts/validate-security.ts
import { SecurityValidator } from '../security-validation-rules';
import { SecureClaudeCodeIntegration } from '../secure-claude-code-integration';

async function runSecurityValidation(): Promise<void> {
  console.log('Starting security validation...');

  const validator = new SecurityValidator();
  const secureCode = new SecureClaudeCodeIntegration();

  // Test 1: Template injection protection
  console.log('Testing template injection protection...');
  const injectionTests = [
    '{{__import__("os").system("rm -rf /")}}',
    '{{eval("malicious_code")}}',
    '{{subprocess.run(["curl", "evil.com"])}}'
  ];

  for (const test of injectionTests) {
    const result = await validator.validateInput(test, 'validation_test');
    if (result.ok) {
      console.error(`SECURITY FAILURE: Template injection not blocked: ${test}`);
      process.exit(1);
    }
  }
  console.log('✅ Template injection protection working');

  // Test 2: Path traversal protection
  console.log('Testing path traversal protection...');
  const pathTests = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32\\config\\sam',
    '/etc/shadow'
  ];

  for (const path of pathTests) {
    const result = await validator.validateFilePath(path, '/test/workspace');
    if (result.ok) {
      console.error(`SECURITY FAILURE: Path traversal not blocked: ${path}`);
      process.exit(1);
    }
  }
  console.log('✅ Path traversal protection working');

  // Test 3: Performance requirements
  console.log('Testing performance requirements...');
  const performanceStart = performance.now();
  await validator.validateInput('performance test input', 'perf_test');
  const performanceTime = performance.now() - performanceStart;

  if (performanceTime > 50) { // 50ms requirement
    console.error(`PERFORMANCE FAILURE: Validation took ${performanceTime}ms (max 50ms)`);
    process.exit(1);
  }
  console.log(`✅ Performance requirements met (${performanceTime.toFixed(2)}ms)`);

  console.log('All security validations passed!');
}

runSecurityValidation().catch(error => {
  console.error('Security validation failed:', error);
  process.exit(1);
});
```

## Operational Procedures

### Daily Security Tasks

1. **Monitor Security Events**
   ```bash
   # Check security logs
   tail -f /var/log/claude-security.log | jq

   # Get security metrics
   curl localhost:3000/api/security/metrics
   ```

2. **Performance Monitoring**
   ```bash
   # Check system health
   curl localhost:3000/api/health/security

   # Monitor AIMDS performance
   curl localhost:8080/aimds/metrics
   ```

3. **Threat Intelligence Updates**
   ```bash
   # Update threat patterns
   npx claude-flow@v3alpha security patterns --update

   # Check for new CVEs
   npm audit --audit-level high
   ```

### Weekly Security Tasks

1. **Security Report Generation**
   ```bash
   # Generate weekly report
   node scripts/generate-security-report.js --period=week

   # Review threat trends
   node scripts/analyze-threat-trends.js
   ```

2. **Performance Optimization**
   ```bash
   # Analyze performance metrics
   node scripts/analyze-performance.js

   # Optimize AIMDS configuration
   npx claude-flow@v3alpha security optimize
   ```

### Monthly Security Tasks

1. **Security Architecture Review**
   - Review threat model
   - Update security controls
   - Assess new vulnerabilities

2. **Penetration Testing**
   ```bash
   # Run comprehensive pen test
   node scripts/run-comprehensive-pentest.js

   # Security audit
   npm run security:audit
   ```

## Troubleshooting Guide

### Common Issues

#### High Latency in Threat Detection
```bash
# Check AIMDS status
curl localhost:8080/aimds/status

# Optimize cache settings
export AIMDS_CACHE_SIZE=1000
export AIMDS_CACHE_TTL=300
```

#### False Positives in Validation
```javascript
// Adjust security level
const validator = new SecurityValidator({
  level: SecurityLevel.BALANCED, // Instead of STRICT
  falsePositiveThreshold: 0.1
});
```

#### Performance Degradation
```bash
# Monitor memory usage
node -e "console.log(process.memoryUsage())"

# Check for memory leaks
node --inspect scripts/memory-leak-test.js
```

### Emergency Procedures

#### Security Incident Response
1. **Immediate Actions**
   - Block suspicious activity
   - Isolate affected systems
   - Preserve evidence

2. **Investigation**
   - Review security logs
   - Analyze threat vectors
   - Assess impact

3. **Recovery**
   - Apply security patches
   - Update threat patterns
   - Restore services

## Conclusion

This implementation guide provides a comprehensive approach to securing the idea-to-PRD Claude Code skill. Follow the phases sequentially, test thoroughly at each stage, and maintain ongoing monitoring and updates.

Remember: Security is not a one-time implementation but an ongoing process that requires continuous attention and improvement.

---

**Document Version**: 1.0
**Last Updated**: 2026-02-11
**Implementation Status**: Ready for Deployment
**Next Review**: 2026-03-11