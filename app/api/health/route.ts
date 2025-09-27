import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  try {
    // Check basic application health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      service: 'dibsfitness',
      checks: {
        memory: checkMemory(),
        environment: checkEnvironment(),
        // Add more health checks as needed
      }
    };

    // Check if any critical checks failed
    const hasFailures = Object.values(health.checks).some(check => 
      typeof check === 'object' && 'status' in check && check.status === 'unhealthy'
    );

    if (hasFailures) {
      return NextResponse.json(
        { ...health, status: 'degraded' },
        { status: 503 }
      );
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

// Memory usage check
function checkMemory() {
  const used = process.memoryUsage();
  const maxHeap = 512 * 1024 * 1024; // 512MB threshold
  
  return {
    status: used.heapUsed < maxHeap ? 'healthy' : 'warning',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    heapTotal: Math.round(used.heapTotal / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
    external: Math.round(used.external / 1024 / 1024),
    unit: 'MB'
  };
}

// Environment variables check
function checkEnvironment() {
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    // Add other critical environment variables
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
    missing: missingVars,
    configured: requiredVars.length - missingVars.length,
    total: requiredVars.length
  };
}

// Readiness check (optional separate endpoint)
export async function HEAD(request: NextRequest) {
  // Simple readiness probe
  return new NextResponse(null, { status: 200 });
}