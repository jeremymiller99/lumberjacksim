/**
 * Performance monitoring utility for the quest system
 * Tracks metrics and provides insights for optimization
 */
export default class QuestPerformanceMonitor {
  private static _instance: QuestPerformanceMonitor | null = null;
  private _metrics = new Map<string, {
    executionTimes: number[];
    memoryUsage: number[];
    eventCounts: number;
    lastUpdated: number;
  }>();
  
  private _startTimes = new Map<string, number>();

  public static getInstance(): QuestPerformanceMonitor {
    if (!this._instance) {
      this._instance = new QuestPerformanceMonitor();
    }
    return this._instance;
  }

  /**
   * Start timing a quest operation
   */
  public startTiming(operation: string): void {
    this._startTimes.set(operation, performance.now());
  }

  /**
   * End timing a quest operation and record the result
   */
  public endTiming(operation: string): void {
    const startTime = this._startTimes.get(operation);
    if (!startTime) return;

    const executionTime = performance.now() - startTime;
    this._startTimes.delete(operation);

    let metrics = this._metrics.get(operation);
    if (!metrics) {
      metrics = {
        executionTimes: [],
        memoryUsage: [],
        eventCounts: 0,
        lastUpdated: Date.now()
      };
      this._metrics.set(operation, metrics);
    }

    metrics.executionTimes.push(executionTime);
    metrics.lastUpdated = Date.now();

    // Keep only the last 100 measurements to prevent memory leaks
    if (metrics.executionTimes.length > 100) {
      metrics.executionTimes.shift();
    }
  }

  /**
   * Record memory usage for a quest operation
   */
  public recordMemoryUsage(operation: string, memoryBytes: number): void {
    let metrics = this._metrics.get(operation);
    if (!metrics) {
      metrics = {
        executionTimes: [],
        memoryUsage: [],
        eventCounts: 0,
        lastUpdated: Date.now()
      };
      this._metrics.set(operation, metrics);
    }

    metrics.memoryUsage.push(memoryBytes);
    metrics.lastUpdated = Date.now();

    // Keep only the last 50 measurements
    if (metrics.memoryUsage.length > 50) {
      metrics.memoryUsage.shift();
    }
  }

  /**
   * Increment event count for a quest operation
   */
  public incrementEventCount(operation: string): void {
    let metrics = this._metrics.get(operation);
    if (!metrics) {
      metrics = {
        executionTimes: [],
        memoryUsage: [],
        eventCounts: 0,
        lastUpdated: Date.now()
      };
      this._metrics.set(operation, metrics);
    }

    metrics.eventCounts++;
    metrics.lastUpdated = Date.now();
  }

  /**
   * Get performance statistics for an operation
   */
  public getStats(operation: string): {
    avgExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
    avgMemoryUsage: number;
    eventCounts: number;
    lastUpdated: number;
  } | null {
    const metrics = this._metrics.get(operation);
    if (!metrics) return null;

    const executionTimes = metrics.executionTimes;
    const memoryUsage = metrics.memoryUsage;

    return {
      avgExecutionTime: executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : 0,
      maxExecutionTime: executionTimes.length > 0 
        ? Math.max(...executionTimes) 
        : 0,
      minExecutionTime: executionTimes.length > 0 
        ? Math.min(...executionTimes) 
        : 0,
      avgMemoryUsage: memoryUsage.length > 0 
        ? memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length 
        : 0,
      eventCounts: metrics.eventCounts,
      lastUpdated: metrics.lastUpdated
    };
  }

  /**
   * Get all performance statistics
   */
  public getAllStats(): { [operation: string]: ReturnType<typeof this.getStats> } {
    const result: { [operation: string]: ReturnType<typeof this.getStats> } = {};
    
    for (const operation of this._metrics.keys()) {
      result[operation] = this.getStats(operation);
    }
    
    return result;
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  public cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [operation, metrics] of this._metrics.entries()) {
      if (now - metrics.lastUpdated > maxAge) {
        this._metrics.delete(operation);
      }
    }
  }

  /**
   * Generate a performance report
   */
  public generateReport(): string {
    const stats = this.getAllStats();
    const lines: string[] = ['=== Quest Performance Report ==='];

    for (const [operation, operationStats] of Object.entries(stats)) {
      if (!operationStats) continue;

      lines.push(`\n${operation}:`);
      lines.push(`  Avg Execution Time: ${operationStats.avgExecutionTime.toFixed(2)}ms`);
      lines.push(`  Max Execution Time: ${operationStats.maxExecutionTime.toFixed(2)}ms`);
      lines.push(`  Min Execution Time: ${operationStats.minExecutionTime.toFixed(2)}ms`);
      lines.push(`  Avg Memory Usage: ${(operationStats.avgMemoryUsage / 1024).toFixed(2)}KB`);
      lines.push(`  Event Count: ${operationStats.eventCounts}`);
      lines.push(`  Last Updated: ${new Date(operationStats.lastUpdated).toISOString()}`);
    }

    return lines.join('\n');
  }

  /**
   * Start periodic cleanup to prevent memory leaks
   */
  public startPeriodicCleanup(): void {
    setInterval(() => this.cleanup(), 10 * 60 * 1000); // Every 10 minutes
  }
}
