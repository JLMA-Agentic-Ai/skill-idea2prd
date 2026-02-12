/**
 * Secure Claude Code Integration Wrapper
 *
 * This module provides a secure wrapper around Claude Code tools (Write, Edit, Read)
 * with comprehensive input validation, path sanitization, and security monitoring.
 */

import { SecurityValidator, SecurityResult, SecurityUtils } from './security-validation-rules';
import { normalize, join, dirname, resolve } from 'path';
import { createHash } from 'crypto';

// Security context for operations
interface SecurityContext {
  requestId: string;
  timestamp: Date;
  source: string;
  operation: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
}

// Secure operation result
interface SecureOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  securityEvents?: SecurityEvent[];
  performanceMetrics?: OperationMetrics;
}

// Security event logging
interface SecurityEvent {
  type: 'validation_passed' | 'threat_detected' | 'sanitization_applied' | 'operation_blocked' | 'integrity_verified';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
  context: SecurityContext;
}

// Performance metrics
interface OperationMetrics {
  validationTimeMs: number;
  operationTimeMs: number;
  totalTimeMs: number;
  bytesProcessed: number;
  securityScansPerformed: number;
}

// Configuration for secure operations
interface SecureConfig {
  baseDirectory: string;
  allowedExtensions: string[];
  maxFileSize: number;
  maxPathLength: number;
  enableIntegrityChecking: boolean;
  enableAtomicOperations: boolean;
  logAllOperations: boolean;
  performanceMonitoring: boolean;
}

const DEFAULT_SECURE_CONFIG: SecureConfig = {
  baseDirectory: '/workspaces/jlmaworkspace',
  allowedExtensions: ['.md', '.txt', '.json', '.pseudo', '.feature', '.yaml', '.yml', '.ts', '.js', '.py'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxPathLength: 255,
  enableIntegrityChecking: true,
  enableAtomicOperations: true,
  logAllOperations: true,
  performanceMonitoring: true
};

/**
 * Secure Claude Code Integration Class
 */
export class SecureClaudeCodeIntegration {
  private validator: SecurityValidator;
  private config: SecureConfig;
  private securityEvents: SecurityEvent[] = [];
  private operationCounter: number = 0;

  constructor(config: Partial<SecureConfig> = {}) {
    this.config = { ...DEFAULT_SECURE_CONFIG, ...config };
    this.validator = new SecurityValidator({
      maxFileSize: this.config.maxFileSize,
      allowedFileExtensions: this.config.allowedExtensions,
      enableAIMDS: true,
      logSecurityEvents: this.config.logAllOperations
    });
  }

  /**
   * Secure Write Operation
   * Wraps Claude Code Write tool with comprehensive security
   */
  async secureWrite(
    filePath: string,
    content: string,
    options: { overwrite?: boolean; backup?: boolean } = {}
  ): Promise<SecureOperationResult> {
    const startTime = performance.now();
    const context = this.createSecurityContext('write', 'high');

    try {
      // 1. Validate and sanitize file path
      const pathValidation = await this.validator.validateFilePath(filePath, this.config.baseDirectory);
      if (!pathValidation.ok) {
        return this.createErrorResult('Path validation failed', pathValidation.error!, context);
      }

      const securePath = pathValidation.value;

      // 2. Validate and sanitize content
      const validationStart = performance.now();
      const contentValidation = await this.validator.validateFileContent(content, securePath);
      const validationTime = performance.now() - validationStart;

      if (!contentValidation.ok) {
        return this.createErrorResult('Content validation failed', contentValidation.error!, context);
      }

      const secureContent = contentValidation.value;

      // 3. Check if file exists and handle accordingly
      if (!options.overwrite) {
        try {
          // Check if file exists using Read tool
          await this.readFileSecure(securePath);
          return this.createErrorResult('File exists and overwrite not allowed', 'file_exists', context);
        } catch {
          // File doesn't exist, proceed
        }
      }

      // 4. Create backup if requested
      if (options.backup) {
        await this.createBackup(securePath, context);
      }

      // 5. Calculate content hash for integrity checking
      const contentHash = SecurityUtils.calculateContentHash(secureContent);

      // 6. Perform atomic write operation
      const writeStart = performance.now();
      let writeResult;

      if (this.config.enableAtomicOperations) {
        writeResult = await this.atomicWrite(securePath, secureContent, context);
      } else {
        writeResult = await this.directWrite(securePath, secureContent, context);
      }

      const writeTime = performance.now() - writeStart;

      if (!writeResult.success) {
        return writeResult;
      }

      // 7. Verify integrity if enabled
      if (this.config.enableIntegrityChecking) {
        const verifyResult = await this.verifyFileIntegrity(securePath, contentHash, context);
        if (!verifyResult.success) {
          return verifyResult;
        }
      }

      // 8. Log successful operation
      this.logSecurityEvent({
        type: 'validation_passed',
        severity: 'low',
        details: {
          operation: 'write',
          path: securePath,
          contentSize: secureContent.length,
          contentHash
        },
        timestamp: new Date(),
        context
      });

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        data: {
          path: securePath,
          size: secureContent.length,
          hash: contentHash
        },
        securityEvents: [...this.securityEvents],
        performanceMetrics: {
          validationTimeMs: validationTime,
          operationTimeMs: writeTime,
          totalTimeMs: totalTime,
          bytesProcessed: secureContent.length,
          securityScansPerformed: 2
        }
      };

    } catch (error) {
      return this.createErrorResult('Write operation failed', error.message, context);
    }
  }

  /**
   * Secure Edit Operation
   * Wraps Claude Code Edit tool with validation
   */
  async secureEdit(
    filePath: string,
    oldString: string,
    newString: string,
    options: { validateBoth?: boolean; backup?: boolean } = { validateBoth: true }
  ): Promise<SecureOperationResult> {
    const startTime = performance.now();
    const context = this.createSecurityContext('edit', 'medium');

    try {
      // 1. Validate file path
      const pathValidation = await this.validator.validateFilePath(filePath, this.config.baseDirectory);
      if (!pathValidation.ok) {
        return this.createErrorResult('Path validation failed', pathValidation.error!, context);
      }

      const securePath = pathValidation.value;

      // 2. Validate old string (if requested)
      const validationStart = performance.now();
      let validationTime = 0;

      if (options.validateBoth) {
        const oldValidation = await this.validator.validateInput(oldString, 'edit_old_string');
        if (!oldValidation.ok) {
          return this.createErrorResult('Old string validation failed', oldValidation.error!, context);
        }
      }

      // 3. Validate and sanitize new string
      const newValidation = await this.validator.validateInput(newString, 'edit_new_string');
      validationTime = performance.now() - validationStart;

      if (!newValidation.ok) {
        return this.createErrorResult('New string validation failed', newValidation.error!, context);
      }

      const secureNewString = newValidation.value;

      // 4. Read current file for backup and validation
      const currentContent = await this.readFileSecure(securePath);
      if (!currentContent.success) {
        return this.createErrorResult('Could not read current file', currentContent.error!, context);
      }

      // 5. Verify old string exists in file
      if (!currentContent.data!.includes(oldString)) {
        return this.createErrorResult('Old string not found in file', 'string_not_found', context);
      }

      // 6. Create backup if requested
      if (options.backup) {
        await this.createBackup(securePath, context);
      }

      // 7. Perform edit operation
      const editStart = performance.now();
      const editResult = await this.performEdit(securePath, oldString, secureNewString, context);
      const editTime = performance.now() - editStart;

      if (!editResult.success) {
        return editResult;
      }

      // 8. Verify edit was successful
      const verifyResult = await this.verifyEdit(securePath, oldString, secureNewString, context);
      if (!verifyResult.success) {
        return verifyResult;
      }

      this.logSecurityEvent({
        type: 'validation_passed',
        severity: 'low',
        details: {
          operation: 'edit',
          path: securePath,
          oldStringLength: oldString.length,
          newStringLength: secureNewString.length
        },
        timestamp: new Date(),
        context
      });

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        data: {
          path: securePath,
          changes: {
            removed: oldString.length,
            added: secureNewString.length,
            delta: secureNewString.length - oldString.length
          }
        },
        securityEvents: [...this.securityEvents],
        performanceMetrics: {
          validationTimeMs: validationTime,
          operationTimeMs: editTime,
          totalTimeMs: totalTime,
          bytesProcessed: oldString.length + secureNewString.length,
          securityScansPerformed: options.validateBoth ? 2 : 1
        }
      };

    } catch (error) {
      return this.createErrorResult('Edit operation failed', error.message, context);
    }
  }

  /**
   * Secure Read Operation
   * Wraps Claude Code Read tool with validation
   */
  async secureRead(
    filePath: string,
    options: { scanContent?: boolean; maxSize?: number } = { scanContent: true }
  ): Promise<SecureOperationResult<string>> {
    const startTime = performance.now();
    const context = this.createSecurityContext('read', 'low');

    try {
      // 1. Validate file path
      const pathValidation = await this.validator.validateFilePath(filePath, this.config.baseDirectory);
      if (!pathValidation.ok) {
        return this.createErrorResult('Path validation failed', pathValidation.error!, context);
      }

      const securePath = pathValidation.value;

      // 2. Perform read operation
      const readStart = performance.now();
      const content = await this.readFileSecure(securePath);
      const readTime = performance.now() - readStart;

      if (!content.success) {
        return content;
      }

      // 3. Check file size if specified
      const maxSize = options.maxSize || this.config.maxFileSize;
      if (content.data!.length > maxSize) {
        return this.createErrorResult('File size exceeds limit', 'file_too_large', context);
      }

      // 4. Scan content if requested
      let scanTime = 0;
      if (options.scanContent) {
        const scanStart = performance.now();
        const contentScan = await this.validator.validateInput(content.data!, `read_${securePath}`);
        scanTime = performance.now() - scanStart;

        if (!contentScan.ok) {
          this.logSecurityEvent({
            type: 'threat_detected',
            severity: 'medium',
            details: {
              operation: 'read',
              path: securePath,
              threat: contentScan.error,
              contentSize: content.data!.length
            },
            timestamp: new Date(),
            context
          });
          // Note: We don't block reads, just log the threat
        }
      }

      this.logSecurityEvent({
        type: 'validation_passed',
        severity: 'low',
        details: {
          operation: 'read',
          path: securePath,
          contentSize: content.data!.length,
          scanPerformed: options.scanContent
        },
        timestamp: new Date(),
        context
      });

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        data: content.data,
        securityEvents: [...this.securityEvents],
        performanceMetrics: {
          validationTimeMs: scanTime,
          operationTimeMs: readTime,
          totalTimeMs: totalTime,
          bytesProcessed: content.data!.length,
          securityScansPerformed: options.scanContent ? 1 : 0
        }
      };

    } catch (error) {
      return this.createErrorResult('Read operation failed', error.message, context);
    }
  }

  /**
   * Utility Methods
   */

  private createSecurityContext(operation: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): SecurityContext {
    return {
      requestId: `req_${Date.now()}_${++this.operationCounter}`,
      timestamp: new Date(),
      source: 'secure_claude_code_integration',
      operation,
      riskLevel
    };
  }

  private createErrorResult(message: string, error: string, context: SecurityContext): SecureOperationResult {
    this.logSecurityEvent({
      type: 'operation_blocked',
      severity: context.riskLevel,
      details: {
        operation: context.operation,
        error,
        message
      },
      timestamp: new Date(),
      context
    });

    return {
      success: false,
      error: message,
      securityEvents: [...this.securityEvents]
    };
  }

  private async atomicWrite(path: string, content: string, context: SecurityContext): Promise<SecureOperationResult> {
    try {
      // Create temporary file
      const tempPath = `${path}.tmp.${Date.now()}`;

      // Write to temporary file first
      await this.directWrite(tempPath, content, context);

      // Verify temporary file
      const tempContent = await this.readFileSecure(tempPath);
      if (!tempContent.success || tempContent.data !== content) {
        // Cleanup temp file
        try {
          await this.deleteFileSecure(tempPath);
        } catch {
          // Ignore cleanup errors
        }
        return this.createErrorResult('Atomic write verification failed', 'atomic_verify_failed', context);
      }

      // Atomic move (rename) to final location
      // Note: This would require file system operations that aren't available through Claude Code tools
      // For now, we'll copy and delete
      await this.directWrite(path, content, context);
      await this.deleteFileSecure(tempPath);

      return { success: true };

    } catch (error) {
      return this.createErrorResult('Atomic write failed', error.message, context);
    }
  }

  private async directWrite(path: string, content: string, context: SecurityContext): Promise<SecureOperationResult> {
    try {
      // This would call the actual Claude Code Write tool
      // For this example, we'll simulate the call
      console.log(`[SECURE WRITE] ${path} (${content.length} bytes)`);

      // In real implementation:
      // await Write({ file_path: path, content });

      return { success: true };

    } catch (error) {
      return this.createErrorResult('Direct write failed', error.message, context);
    }
  }

  private async readFileSecure(path: string): Promise<SecureOperationResult<string>> {
    try {
      // This would call the actual Claude Code Read tool
      // For this example, we'll simulate the call
      console.log(`[SECURE READ] ${path}`);

      // In real implementation:
      // const content = await Read({ file_path: path });
      // return { success: true, data: content };

      // Mock response for example
      return { success: true, data: 'mock file content' };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async deleteFileSecure(path: string): Promise<SecureOperationResult> {
    try {
      // This would require additional Claude Code functionality or shell commands
      console.log(`[SECURE DELETE] ${path}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async performEdit(path: string, oldString: string, newString: string, context: SecurityContext): Promise<SecureOperationResult> {
    try {
      // This would call the actual Claude Code Edit tool
      console.log(`[SECURE EDIT] ${path}`);

      // In real implementation:
      // await Edit({ file_path: path, old_string: oldString, new_string: newString });

      return { success: true };

    } catch (error) {
      return this.createErrorResult('Edit operation failed', error.message, context);
    }
  }

  private async verifyEdit(path: string, oldString: string, newString: string, context: SecurityContext): Promise<SecureOperationResult> {
    try {
      const currentContent = await this.readFileSecure(path);
      if (!currentContent.success) {
        return currentContent;
      }

      // Verify old string was replaced
      if (currentContent.data!.includes(oldString)) {
        return this.createErrorResult('Edit verification failed - old string still present', 'edit_verify_failed', context);
      }

      // Verify new string is present
      if (!currentContent.data!.includes(newString)) {
        return this.createErrorResult('Edit verification failed - new string not found', 'edit_verify_failed', context);
      }

      return { success: true };

    } catch (error) {
      return this.createErrorResult('Edit verification failed', error.message, context);
    }
  }

  private async verifyFileIntegrity(path: string, expectedHash: string, context: SecurityContext): Promise<SecureOperationResult> {
    try {
      const content = await this.readFileSecure(path);
      if (!content.success) {
        return content;
      }

      const actualHash = SecurityUtils.calculateContentHash(content.data!);
      if (actualHash !== expectedHash) {
        return this.createErrorResult('File integrity verification failed', 'integrity_mismatch', context);
      }

      this.logSecurityEvent({
        type: 'integrity_verified',
        severity: 'low',
        details: {
          path,
          expectedHash,
          actualHash
        },
        timestamp: new Date(),
        context
      });

      return { success: true };

    } catch (error) {
      return this.createErrorResult('Integrity verification failed', error.message, context);
    }
  }

  private async createBackup(path: string, context: SecurityContext): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${path}.backup.${timestamp}`;

      const content = await this.readFileSecure(path);
      if (content.success) {
        await this.directWrite(backupPath, content.data!, context);

        this.logSecurityEvent({
          type: 'validation_passed',
          severity: 'low',
          details: {
            operation: 'backup',
            originalPath: path,
            backupPath
          },
          timestamp: new Date(),
          context
        });
      }
    } catch (error) {
      // Log but don't fail the main operation
      console.warn(`Backup creation failed for ${path}:`, error.message);
    }
  }

  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    if (this.config.logAllOperations) {
      const logEntry = {
        ...event,
        details: {
          ...event.details,
          requestId: event.context.requestId
        }
      };
      console.log(`[SECURITY EVENT] ${JSON.stringify(logEntry)}`);
    }

    // In production, send to security monitoring system
    // await securityMonitor.logEvent(event);
  }

  /**
   * Get security metrics for monitoring
   */
  getSecurityMetrics(): {
    totalOperations: number;
    securityEvents: SecurityEvent[];
    threatsSummary: Record<string, number>;
    performanceSummary: {
      avgValidationTime: number;
      avgOperationTime: number;
      totalBytesProcessed: number;
    };
  } {
    const threats: Record<string, number> = {};
    let totalValidationTime = 0;
    let totalOperationTime = 0;
    let totalBytes = 0;
    let operationsWithMetrics = 0;

    // This would need to be tracked properly in a real implementation
    // For now, return mock data

    return {
      totalOperations: this.operationCounter,
      securityEvents: [...this.securityEvents],
      threatsSummary: threats,
      performanceSummary: {
        avgValidationTime: 5.2,
        avgOperationTime: 15.8,
        totalBytesProcessed: 1024000
      }
    };
  }

  /**
   * Clear security event history (for testing/reset)
   */
  clearSecurityEvents(): void {
    this.securityEvents = [];
  }
}

// Export default instance
export const secureClaudeCode = new SecureClaudeCodeIntegration();

// Export types for external use
export type {
  SecurityContext,
  SecureOperationResult,
  SecurityEvent,
  OperationMetrics,
  SecureConfig
};