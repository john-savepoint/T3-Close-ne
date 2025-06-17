import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://precise-pipefish-49835.upstash.io',
  token: 'AcKrAAIjcDE2YmM0MDkyOTI2ODk0NTc3OWFlODFiNjljNjk0ZTdmNHAxMA',
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test basic string operations first
    await redis.set('test-string', 'hello world');
    const stringResult = await redis.get('test-string');
    
    // Test JSON operations more carefully
    const testData = { hello: 'world', timestamp: Date.now() };
    const jsonString = JSON.stringify(testData);
    
    console.log('Original data:', testData);
    console.log('JSON string:', jsonString);
    console.log('JSON string type:', typeof jsonString);
    
    await redis.set('test-json', jsonString);
    const retrievedJson = await redis.get('test-json');
    
    console.log('Retrieved JSON:', retrievedJson);
    console.log('Retrieved JSON type:', typeof retrievedJson);
    
    let parsedData = null;
    try {
      parsedData = JSON.parse(retrievedJson as string);
    } catch (parseError) {
      console.log('Parse error:', parseError);
    }
    
    // Cleanup
    await redis.del('test-string', 'test-json');
    
    return NextResponse.json({
      success: true,
      tests: {
        string: { 
          original: 'hello world', 
          retrieved: stringResult 
        },
        json: { 
          original: testData,
          jsonString: jsonString,
          retrieved: retrievedJson,
          parsed: parsedData
        }
      }
    });

  } catch (error) {
    console.error('Debug Redis error:', error);
    return NextResponse.json(
      { 
        error: 'Redis debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}