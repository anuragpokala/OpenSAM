import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const collection = searchParams.get('collection');
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (action) {
      case 'stats':
        // Get vector store statistics
        const statsData = await vectorStoreServerUtils.getStats();
        return NextResponse.json({ success: true, data: statsData });

      case 'collections':
        // List all collections
        const collectionsList = await vectorStoreServerUtils.listCollections();
        return NextResponse.json({ success: true, data: collectionsList });

      case 'sample':
        // Get sample data from a specific collection
        if (!collection) {
          return NextResponse.json({ 
            error: 'Collection parameter is required for sample action' 
          }, { status: 400 });
        }

        try {
          // Create a dummy query vector to get sample results
          const dummyVector = new Array(1536).fill(0.1);
          const sampleResults = await vectorStoreServerUtils.searchVectors(
            dummyVector, 
            collection, 
            limit
          );

          return NextResponse.json({ 
            success: true, 
            data: {
              collection,
              count: sampleResults.length,
              samples: sampleResults
            }
          });
        } catch (error) {
          console.error(`Failed to get sample data from collection ${collection}:`, error);
          return NextResponse.json({ 
            success: true, 
            data: {
              collection,
              count: 0,
              samples: [],
              error: 'Collection may be empty or inaccessible'
            }
          });
        }

      case 'delete':
        // Delete a collection
        if (!collection) {
          return NextResponse.json({ 
            error: 'Collection parameter is required for delete action' 
          }, { status: 400 });
        }

        await vectorStoreServerUtils.deleteCollection(collection);
        return NextResponse.json({ 
          success: true, 
          message: `Collection ${collection} deleted successfully` 
        });

      case 'delete-record':
        // Delete individual records from a collection
        if (!collection) {
          return NextResponse.json({ 
            error: 'Collection parameter is required for delete-record action' 
          }, { status: 400 });
        }

        const recordIds = searchParams.get('ids');
        if (!recordIds) {
          return NextResponse.json({ 
            error: 'Record IDs parameter is required for delete-record action' 
          }, { status: 400 });
        }

        const ids = recordIds.split(',').map(id => id.trim());
        await vectorStoreServerUtils.deleteVectors(collection, ids);
        return NextResponse.json({ 
          success: true, 
          message: `${ids.length} record(s) deleted from collection ${collection}` 
        });

      default:
        // Default: return comprehensive vector store information
        const [storeStats, storeCollections] = await Promise.all([
          vectorStoreServerUtils.getStats(),
          vectorStoreServerUtils.listCollections()
        ]);

        // Get sample data from each collection
        const collectionDetails = await Promise.all(
          storeCollections.map(async (col) => {
            try {
              const dummyVector = new Array(1536).fill(0.1);
              const samples = await vectorStoreServerUtils.searchVectors(
                dummyVector, 
                col, 
                5 // Limit to 5 samples per collection
              );
              
              return {
                name: col,
                sampleCount: samples.length,
                samples: samples.slice(0, 3), // Only return first 3 samples
                hasData: samples.length > 0
              };
            } catch (error) {
              return {
                name: col,
                sampleCount: 0,
                samples: [],
                hasData: false,
                error: 'Unable to access collection'
              };
            }
          })
        );

        return NextResponse.json({
          success: true,
          data: {
            stats: storeStats,
            collections: collectionDetails
          }
        });
    }
  } catch (error) {
    console.error('Vector store API error:', error);
    return NextResponse.json({ 
      error: 'Failed to access vector store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 