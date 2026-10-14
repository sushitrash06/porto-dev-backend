import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsEventType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: TrackEventDto, ip?: string, userAgent?: string) {
    // Verify target user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });

    if (!userExists) {
      return { success: false, message: 'User not found' };
    }

    // Mask/sanitize IP address for privacy
    let sanitizedIp = ip;
    if (sanitizedIp && sanitizedIp.includes(',')) {
      sanitizedIp = sanitizedIp.split(',')[0].trim();
    }

    const event = await this.prisma.analyticsEvent.create({
      data: {
        userId: dto.userId,
        eventType: dto.eventType,
        targetId: dto.targetId || null,
        targetTitle: dto.targetTitle || null,
        visitorIp: sanitizedIp || null,
        userAgent: userAgent ? userAgent.substring(0, 255) : null,
        referrer: dto.referrer ? dto.referrer.substring(0, 255) : null,
      },
    });

    return { success: true, id: event.id };
  }

  async getDashboardAnalytics(userId: string, days: number = 30) {
    const safeDays = Math.min(Math.max(days || 30, 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - safeDays);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all events within range
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 1. Overall Summary
    const profileViews = events.filter((e) => e.eventType === AnalyticsEventType.PROFILE_VIEW);
    const projectViews = events.filter((e) => e.eventType === AnalyticsEventType.PROJECT_VIEW);
    const socialClicks = events.filter(
      (e) =>
        e.eventType === AnalyticsEventType.SOCIAL_CLICK ||
        e.eventType === AnalyticsEventType.CV_DOWNLOAD,
    );

    // Unique visitors by IP
    const uniqueIps = new Set(
      profileViews
        .map((e) => e.visitorIp)
        .filter((ip): ip is string => Boolean(ip)),
    );
    const uniqueVisitorsCount = uniqueIps.size > 0 ? uniqueIps.size : profileViews.length;

    // 2. Trend Timeline (Grouped by Day)
    const trendMap = new Map<
      string,
      { date: string; label: string; profileViews: number; projectViews: number; socialClicks: number }
    >();

    // Pre-populate days so there are no empty date gaps
    for (let i = safeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      trendMap.set(dateKey, {
        date: dateKey,
        label,
        profileViews: 0,
        projectViews: 0,
        socialClicks: 0,
      });
    }

    for (const ev of events) {
      const dateKey = ev.createdAt.toISOString().split('T')[0];
      const entry = trendMap.get(dateKey);
      if (entry) {
        if (ev.eventType === AnalyticsEventType.PROFILE_VIEW) {
          entry.profileViews++;
        } else if (ev.eventType === AnalyticsEventType.PROJECT_VIEW) {
          entry.projectViews++;
        } else {
          entry.socialClicks++;
        }
      }
    }

    const viewsTrend = Array.from(trendMap.values());

    // 3. Top Projects by Views
    const projectCountMap = new Map<string, { title: string; count: number }>();
    for (const ev of projectViews) {
      const key = ev.targetId || ev.targetTitle || 'Unknown Project';
      const title = ev.targetTitle || 'Showcase Project';
      const current = projectCountMap.get(key) || { title, count: 0 };
      current.count++;
      projectCountMap.set(key, current);
    }

    const topProjects = Array.from(projectCountMap.entries())
      .map(([projectId, info]) => ({
        projectId,
        title: info.title,
        views: info.count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    // 4. Social Clicks Breakdown
    const socialCountMap = new Map<string, number>();
    for (const ev of socialClicks) {
      const platform = (ev.targetTitle || ev.targetId || 'Other').toLowerCase();
      socialCountMap.set(platform, (socialCountMap.get(platform) || 0) + 1);
    }

    const socialClicksBreakdown = Array.from(socialCountMap.entries())
      .map(([platform, clicks]) => ({
        platform,
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    // 5. Recent Activity (last 10 events)
    const recentActivity = events.slice(0, 10).map((ev) => ({
      id: ev.id,
      eventType: ev.eventType,
      targetId: ev.targetId,
      targetTitle: ev.targetTitle,
      referrer: ev.referrer,
      createdAt: ev.createdAt.toISOString(),
    }));

    return {
      summary: {
        totalProfileViews: profileViews.length,
        uniqueVisitors: uniqueVisitorsCount,
        totalProjectViews: projectViews.length,
        totalSocialClicks: socialClicks.length,
        days: safeDays,
      },
      viewsTrend,
      topProjects,
      socialClicksBreakdown,
      recentActivity,
    };
  }
}
