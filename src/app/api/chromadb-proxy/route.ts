import { NextRequest, NextResponse } from 'next/server';

const CHROMADB_URL = process.env.VECTOR_STORE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chromadb-proxy', '');
  const targetUrl = `${CHROMADB_URL}${path}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('ChromaDB proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ChromaDB' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chromadb-proxy', '');
  const targetUrl = `${CHROMADB_URL}${path}${url.search}`;

  try {
    const body = await request.json();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('ChromaDB proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ChromaDB' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chromadb-proxy', '');
  const targetUrl = `${CHROMADB_URL}${path}${url.search}`;

  try {
    const body = await request.json();
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('ChromaDB proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ChromaDB' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chromadb-proxy', '');
  const targetUrl = `${CHROMADB_URL}${path}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('ChromaDB proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ChromaDB' },
      { status: 500 }
    );
  }
} 