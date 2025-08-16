import { NextRequest, NextResponse } from 'next/server';
import { RealTimeMatcher } from '@/lib/real-time-matching';
import { CompanyProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyProfile, config } = body;

    const matcher = RealTimeMatcher.getInstance();

    switch (action) {
      case 'start':
        if (!companyProfile) {
          return NextResponse.json({ error: 'Company profile is required' }, { status: 400 });
        }
        await matcher.startMatching(companyProfile);
        return NextResponse.json({
          success: true,
          message: `Started real-time matching for ${companyProfile.entityName}`
        });

      case 'stop':
        matcher.stopMatching();
        return NextResponse.json({
          success: true,
          message: 'Stopped real-time matching'
        });

      case 'update_config':
        if (config) {
          matcher.updateConfig(config);
          return NextResponse.json({
            success: true,
            message: 'Updated matching configuration'
          });
        }
        return NextResponse.json({ error: 'Configuration is required' }, { status: 400 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Matching action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform matching action' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const companyProfileId = searchParams.get('companyProfileId');

    const matcher = RealTimeMatcher.getInstance();

    switch (action) {
      case 'stats':
        const stats = matcher.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'alerts':
        if (!companyProfileId) {
          return NextResponse.json({ error: 'Company profile ID is required' }, { status: 400 });
        }
        const alerts = matcher.getAlerts(companyProfileId);
        return NextResponse.json({
          success: true,
          data: {
            alerts,
            count: alerts.length,
            unreadCount: alerts.filter(alert => !alert.read).length
          }
        });

      case 'config':
        // Return current configuration (this would need to be exposed in the RealTimeMatcher)
        return NextResponse.json({
          success: true,
          data: {
            checkInterval: 5 * 60 * 1000, // 5 minutes
            minMatchScore: 70,
            maxAlertsPerProfile: 10,
            enableNotifications: true,
            autoRefresh: true
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Matching query error:', error);
    return NextResponse.json(
      { error: 'Failed to get matching data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, companyProfileId, actionTaken } = body;

    const matcher = RealTimeMatcher.getInstance();

    switch (action) {
      case 'mark_read':
        if (!alertId || !companyProfileId) {
          return NextResponse.json({ error: 'Alert ID and company profile ID are required' }, { status: 400 });
        }
        matcher.markAlertAsRead(alertId, companyProfileId);
        return NextResponse.json({
          success: true,
          message: 'Alert marked as read'
        });

      case 'mark_action_taken':
        if (!alertId || !companyProfileId || !actionTaken) {
          return NextResponse.json({ error: 'Alert ID, company profile ID, and action are required' }, { status: 400 });
        }
        matcher.markAlertActionTaken(alertId, companyProfileId, actionTaken);
        return NextResponse.json({
          success: true,
          message: 'Alert marked as action taken'
        });

      case 'clear_alerts':
        if (!companyProfileId) {
          return NextResponse.json({ error: 'Company profile ID is required' }, { status: 400 });
        }
        matcher.clearAlerts(companyProfileId);
        return NextResponse.json({
          success: true,
          message: 'Alerts cleared'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Matching update error:', error);
    return NextResponse.json(
      { error: 'Failed to update matching data' },
      { status: 500 }
    );
  }
} 