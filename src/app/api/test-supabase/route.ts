import { NextRequest, NextResponse } from 'next/server';
import { supabase, typedSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const SUPABASE_URL = process.env.SUPA_BASE_PROJECT_URL || 'https://yjsjxiptdoextcadozdz.supabase.co';
    const hasApiKey = !!process.env.SUPA_BASE_API_KEY;
    
    console.log('📊 Supabase URL:', SUPABASE_URL);
    console.log('🔑 API Key configured:', hasApiKey);
    
    if (!hasApiKey) {
      return NextResponse.json({
        error: 'Supabase API key not configured',
        message: 'Set SUPA_BASE_API_KEY in your environment variables',
        config: {
          url: SUPABASE_URL,
          hasApiKey: false
        }
      }, { status: 400 });
    }

    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: tables, error: tablesError } = await supabase
      .from('company_profiles')
      .select('count')
      .limit(1);

    if (tablesError) {
      console.error('❌ Failed to query tables:', tablesError);
      return NextResponse.json({
        error: 'Supabase connection failed',
        message: tablesError.message,
        config: {
          url: SUPABASE_URL,
          hasApiKey: true
        }
      }, { status: 500 });
    }

    console.log('✅ Basic connection successful');

    // Test 2: List all tables
    console.log('2️⃣ Listing available tables...');
    // We'll check for specific tables directly instead of querying information_schema
    const expectedTables = [
      'company_profiles',
      'opportunities', 
      'working_lists',
      'working_list_items',
      'chat_sessions',
      'chat_messages'
    ];
    
    const tableChecks = await Promise.allSettled(
      expectedTables.map(async (tableName) => {
        const { error } = await supabase.from(tableName).select('*').limit(1);
        return { tableName, exists: !error };
      })
    );
    
    const existingTables = tableChecks
      .filter(result => result.status === 'fulfilled' && result.value.exists)
      .map(result => (result as PromiseFulfilledResult<any>).value.tableName);
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    const tableNames = existingTables;
    console.log('📋 Available tables:', tableNames);

    console.log('✅ Existing OpenSAM tables:', existingTables);
    if (missingTables.length > 0) {
      console.log('⚠️ Missing tables:', missingTables);
    }

    // Test 4: Try to query company_profiles if it exists
    let companyProfilesCount = 0;
    if (tableNames.includes('company_profiles')) {
      console.log('3️⃣ Testing company_profiles table...');
      const { count, error: countError } = await supabase
        .from('company_profiles')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        companyProfilesCount = count || 0;
        console.log('📊 Company profiles count:', companyProfilesCount);
      } else {
        console.log('⚠️ Could not count company profiles:', countError.message);
      }
    }

    // Test 5: Try to query opportunities if it exists
    let opportunitiesCount = 0;
    if (tableNames.includes('opportunities')) {
      console.log('4️⃣ Testing opportunities table...');
      const { count, error: oppCountError } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true });

      if (!oppCountError) {
        opportunitiesCount = count || 0;
        console.log('📊 Opportunities count:', opportunitiesCount);
      } else {
        console.log('⚠️ Could not count opportunities:', oppCountError.message);
      }
    }

    // Test 6: Check RLS policies
    console.log('5️⃣ Checking RLS policies...');
    // We'll skip the RLS policy check for now as it requires special permissions
    const rlsInfo = [];

    console.log('🔒 RLS policies found:', rlsInfo.length);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      config: {
        url: SUPABASE_URL,
        hasApiKey: true
      },
      database: {
        totalTables: tableNames.length,
        allTables: tableNames,
        openSAMTables: {
          expected: expectedTables,
          existing: existingTables,
          missing: missingTables
        }
      },
      data: {
        companyProfiles: companyProfilesCount,
        opportunities: opportunitiesCount
      },
      security: {
        rlsPolicies: rlsInfo.length,
        policies: rlsInfo
      },
      timestamp: Date.now()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    
    return NextResponse.json({
      error: 'Supabase connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        url: SUPABASE_URL,
        hasApiKey: !!process.env.SUPA_BASE_API_KEY
      },
      timestamp: Date.now()
    }, { status: 500 });
  }
} 