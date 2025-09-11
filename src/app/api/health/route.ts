import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import packageJson from '../../../../package.json';

export async function GET() {
  try {
    // Check database connection by querying a simple table
    const supabase = await createClient();
    
    // Try to perform a simple query to verify database connectivity
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    // Return successful health check
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: packageJson.version,
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Return unhealthy status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage,
        environment: process.env.NODE_ENV || 'development',
        database: 'disconnected',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
      },
      { status: 500 }
    );
  }
}

// Allow preflight requests
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}