import { put } from '@vercel/blob';

export async function POST(request) {
  console.log('API Debug - Method:', request.method);
  console.log('API Debug - URL:', request.url);
  console.log('API Debug - Headers:', Object.fromEntries(request.headers.entries()));
  console.log('API Debug - request.body type:', typeof request.body);
  console.log('API Debug - request.body:', request.body);
  console.log('API Debug - request.body constructor:', request.body?.constructor?.name);

  try {
    // Extract filename from query parameters
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    console.log('API Debug - Filename from query:', filename);

    if (!filename) {
      console.log('API Debug - Missing filename parameter');
      return new Response(JSON.stringify({ 
        error: 'Missing required query parameter: filename' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!request.body) {
      console.log('API Debug - Missing request body');
      return new Response(JSON.stringify({ 
        error: 'No file data received' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('API Debug - About to call put() with filename:', filename);
    console.log('API Debug - About to call put() with body type:', typeof request.body);

    // Upload raw file body to Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log(`Blob upload successful: ${blob.url}`);

    return new Response(JSON.stringify({
      success: true,
      blobUrl: blob.url,
      message: 'File uploaded to blob storage successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    console.error('Error stack:', error.stack);

    return new Response(JSON.stringify({
      success: false,
      error: 'Blob upload failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}