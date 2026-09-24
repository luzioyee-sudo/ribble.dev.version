import { AppNotification, AppAd } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const NOTIFICATIONS_STORAGE_KEY = 'lingoflow_app_notifications_v6';
const ADS_STORAGE_KEY = 'lingoflow_app_ads_v6';

// Initial notifications and ads default to empty
const INITIAL_NOTIFICATIONS: AppNotification[] = [];
const INITIAL_ADS: AppAd[] = [];

import { isFirestoreQuotaExceeded, handleFirestoreError } from './firestoreQuotaTracker';

class NotificationManager {
  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingoflow_notifications_changed'));
    }
  }

  private notifyAdsListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingoflow_ads_changed'));
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public saveNotifications(notifications: AppNotification[]) {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }

  public getUserNotifications(userId: string): AppNotification[] {
    const all = this.getNotifications();
    return all.filter((n) => {
      // Broadcast to all OR specific to this user
      const isForUser = n.targetUserId === 'all' || !n.targetUserId || n.targetUserId === userId;
      const isDismissed = n.dismissedBy && n.dismissedBy.includes(userId);
      return isForUser && !isDismissed;
    });
  }

  public getUnreadCount(userId: string): number {
    const userNotifs = this.getUserNotifications(userId);
    return userNotifs.filter((n) => !n.readBy || !n.readBy.includes(userId)).length;
  }

  public async sendNotification(data: {
    title: string;
    message: string;
    type?: 'ad' | 'message' | 'announcement' | 'system' | 'warning';
    targetUserId?: string | 'all';
    targetUserName?: string;
    targetUserEmail?: string;
    senderName?: string;
    actionText?: string;
    actionUrl?: string;
    bannerUrl?: string;
    badgeText?: string;
    priority?: 'normal' | 'high' | 'urgent';
    adId?: string;
  }): Promise<AppNotification> {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      message: data.message,
      type: data.type || 'message',
      targetUserId: data.targetUserId || 'all',
      targetUserName: data.targetUserName,
      targetUserEmail: data.targetUserEmail,
      senderName: data.senderName || 'Admin Team',
      createdAt: new Date().toISOString(),
      readBy: [],
      dismissedBy: [],
      actionText: data.actionText,
      actionUrl: data.actionUrl,
      bannerUrl: data.bannerUrl,
      badgeText: data.badgeText || (data.type === 'ad' ? 'SPONSORED' : data.targetUserId === 'all' ? 'BROADCAST' : 'DIRECT MESSAGE'),
      priority: data.priority || 'normal',
      adId: data.adId,
    };

    const current = this.getNotifications();
    const updated = [newNotif, ...current];
    this.saveNotifications(updated);

    // Sync to Firestore asynchronously if connected
    try {
      if (db && !isFirestoreQuotaExceeded()) {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }

    return newNotif;
  }

  public markAsRead(notificationId: string, userId: string) {
    const current = this.getNotifications();
    const updated = current.map((n) => {
      if (n.id === notificationId) {
        const readBy = n.readBy || [];
        if (!readBy.includes(userId)) {
          return { ...n, readBy: [...readBy, userId] };
        }
      }
      return n;
    });
    this.saveNotifications(updated);
  }

  public markAllAsRead(userId: string) {
    const current = this.getNotifications();
    const updated = current.map((n) => {
      const readBy = n.readBy || [];
      if (!readBy.includes(userId)) {
        return { ...n, readBy: [...readBy, userId] };
      }
      return n;
    });
    this.saveNotifications(updated);
  }

  public dismissNotification(notificationId: string, userId: string) {
    const current = this.getNotifications();
    const updated = current.map((n) => {
      if (n.id === notificationId) {
        const dismissedBy = n.dismissedBy || [];
        if (!dismissedBy.includes(userId)) {
          return { ...n, dismissedBy: [...dismissedBy, userId] };
        }
      }
      return n;
    });
    this.saveNotifications(updated);
  }

  public async deleteNotification(notificationId: string) {
    const current = this.getNotifications();
    const updated = current.filter((n) => n.id !== notificationId);
    this.saveNotifications(updated);

    try {
      if (db && !isFirestoreQuotaExceeded()) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }
  }

  // --- CONVENIENCE LANGUAGE-LEARNING NOTIFICATION TRIGGERS ---
  public triggerStreakReminder(days: number = 5, userId: string = 'all') {
    return this.sendNotification({
      title: 'Streak Reminder',
      message: `Don't break your ${days}-day streak! Complete your daily 5-minute review before midnight.`,
      type: 'system',
      targetUserId: userId,
      senderName: 'Streak Guardian',
      badgeText: 'STREAK',
      priority: 'high',
      actionText: 'Keep Streak',
      actionUrl: '#flashcards',
    });
  }

  public triggerWordMastered(wordCount: number = 10, deckName: string = 'Spanish Vocabulary', userId: string = 'all') {
    return this.sendNotification({
      title: 'New Words Mastered',
      message: `Awesome! You mastered ${wordCount} new words in "${deckName}" today with a 95% retention score.`,
      type: 'system',
      targetUserId: userId,
      senderName: 'Vocabulary Coach',
      badgeText: 'MASTERED',
      priority: 'normal',
      actionText: 'Review Deck',
      actionUrl: '#flashcards',
    });
  }

  public triggerDailyGoalProgress(minutesDone: number = 15, goalMinutes: number = 15, userId: string = 'all') {
    return this.sendNotification({
      title: 'Daily Goal Achieved',
      message: `Goal reached! You completed ${minutesDone}/${goalMinutes} minutes of active dual-language reading.`,
      type: 'system',
      targetUserId: userId,
      senderName: 'Daily Goal Tracker',
      badgeText: 'GOAL',
      priority: 'normal',
      actionText: 'Open Reader',
      actionUrl: '#reader',
    });
  }

  public triggerPracticeInvite(coachName: string = 'Sarah', topic: string = 'Ordering Tapas in Madrid', userId: string = 'all') {
    return this.sendNotification({
      title: 'Practice Session Invite',
      message: `AI Coach ${coachName} is ready for your 10-minute conversational roleplay "${topic}".`,
      type: 'message',
      targetUserId: userId,
      senderName: 'AI Speaking Tutor',
      badgeText: 'PRACTICE',
      priority: 'high',
      actionText: 'Start Speaking',
      actionUrl: '#practice',
    });
  }

  // --- ADS SYSTEM ---
  public getAds(): AppAd[] {
    try {
      const data = localStorage.getItem(ADS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(INITIAL_ADS));
      return INITIAL_ADS;
    } catch {
      return INITIAL_ADS;
    }
  }

  public saveAds(ads: AppAd[], notify = true) {
    try {
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads));
      if (notify) {
        this.notifyAdsListeners();
      }
    } catch (e) {
      console.error('Failed to save ads:', e);
    }
  }

  public getActiveAdsForPage(page: string, userId?: string): AppAd[] {
    const all = this.getAds();
    const now = Date.now();

    return all.filter((ad) => {
      // 1. Must be active
      if (!ad.active) return false;

      // 2. Check temporary pause
      if (ad.pausedUntil) {
        const pauseTime = new Date(ad.pausedUntil).getTime();
        if (!isNaN(pauseTime) && pauseTime > now) {
          return false; // Currently paused until future timestamp
        }
      }

      // 3. Check scheduled start date (if scheduled for the future)
      if (ad.startDate) {
        const startTime = new Date(ad.startDate).getTime();
        if (!isNaN(startTime) && startTime > now) {
          return false; // Not started yet
        }
      }

      // 4. Check expiration date
      if (ad.expiresAt) {
        const expTime = new Date(ad.expiresAt).getTime();
        if (!isNaN(expTime) && expTime <= now) {
          return false; // Already expired
        }
      }

      // 5. Check page targeting
      const isTargetMatch =
        ad.targetPage === 'all' ||
        ad.targetPage === page ||
        (Array.isArray(ad.targetPages) && ad.targetPages.includes(page));

      if (!isTargetMatch) return false;

      // 6. Check user dismissal
      if (userId && ad.dismissedBy && ad.dismissedBy.includes(userId)) {
        return false;
      }

      return true;
    });
  }

  public async createAd(
    data: Omit<AppAd, 'id' | 'createdAt' | 'clicksCount' | 'impressionsCount'>,
    sendAsNotification = true
  ): Promise<AppAd> {
    const newAd: AppAd = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      description: data.description,
      targetPage: data.targetPage || 'all',
      targetPages: data.targetPages || (data.targetPage !== 'all' ? [data.targetPage] : undefined),
      placement: data.placement || 'top-banner',
      badgeText: data.badgeText || 'Sponsored',
      imageUrl: data.imageUrl,
      ctaText: data.ctaText || 'Learn More',
      ctaUrl: data.ctaUrl || '#reader',
      active: data.active !== undefined ? data.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: data.startDate,
      expiresAt: data.expiresAt,
      pausedUntil: data.pausedUntil,
      pauseReason: data.pauseReason,
      delaySeconds: data.delaySeconds || 0,
      frequency: data.frequency || 'always',
      
      // Visual Custom Styling
      cardTheme: data.cardTheme || 'pastel-blue',
      bgColor: data.bgColor,
      textColor: data.textColor,
      accentColor: data.accentColor,
      cardFont: data.cardFont || 'sans',
      titleSize: data.titleSize || 'md',
      bodySize: data.bodySize || 'sm',
      textAlign: data.textAlign || 'left',
      cardLayout: data.cardLayout || 'standard',
      iconBadge: data.iconBadge,
      subtitlePrice: data.subtitlePrice,
      bulletPoints: data.bulletPoints,
      cardRadius: data.cardRadius || 'squircle',
      cardWidth: data.cardWidth || 'standard',
      
      themeColor: data.themeColor,
      clicksCount: 0,
      impressionsCount: 0,
      dismissedBy: [],
    };

    const current = this.getAds();
    const updated = [newAd, ...current];
    this.saveAds(updated);

    // Also send an accompanying notification to all users' notification bell if requested!
    if (sendAsNotification) {
      await this.sendNotification({
        title: `📢 ${newAd.title}`,
        message: newAd.description,
        type: 'ad',
        targetUserId: 'all',
        senderName: 'Ribble Sponsor & Ads',
        actionText: newAd.ctaText,
        actionUrl: newAd.ctaUrl,
        bannerUrl: newAd.imageUrl,
        badgeText: newAd.badgeText || 'SPONSORED',
        priority: 'high',
        adId: newAd.id,
      });
    }

    // Sync to Firestore if available
    try {
      if (db && !isFirestoreQuotaExceeded()) {
        await setDoc(doc(db, 'ads', newAd.id), newAd);
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }

    return newAd;
  }

  public updateAd(adId: string, updates: Partial<AppAd>) {
    const current = this.getAds();
    const withTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const updated = current.map((ad) => (ad.id === adId ? { ...ad, ...withTimestamp } : ad));
    this.saveAds(updated);

    try {
      if (db && !isFirestoreQuotaExceeded()) {
        updateDoc(doc(db, 'ads', adId), withTimestamp).catch((err) => handleFirestoreError(err, 'NotificationManager'));
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }
  }

  public async deleteAd(adId: string) {
    const current = this.getAds();
    const updated = current.filter((a) => a.id !== adId);
    this.saveAds(updated);

    try {
      if (db && !isFirestoreQuotaExceeded()) {
        await deleteDoc(doc(db, 'ads', adId));
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }
  }

  public toggleAdActive(adId: string): boolean {
    const current = this.getAds();
    let newStatus = false;
    const updated = current.map((ad) => {
      if (ad.id === adId) {
        newStatus = !ad.active;
        // If enabling, clear past pause timestamps
        return {
          ...ad,
          active: newStatus,
          pausedUntil: newStatus ? undefined : ad.pausedUntil,
          updatedAt: new Date().toISOString(),
        };
      }
      return ad;
    });
    this.saveAds(updated);

    try {
      if (db && !isFirestoreQuotaExceeded()) {
        updateDoc(doc(db, 'ads', adId), {
          active: newStatus,
          updatedAt: new Date().toISOString(),
        }).catch((err) => handleFirestoreError(err, 'NotificationManager'));
      }
    } catch (err) {
      handleFirestoreError(err, 'NotificationManager');
    }

    return newStatus;
  }

  /**
   * Temporary pause an ad for a specific duration or until a date
   */
  public pauseAdForDuration(
    adId: string,
    options: {
      durationHours?: number;
      untilISO?: string;
      reason?: string;
    }
  ) {
    let pausedUntil: string | undefined;

    if (options.untilISO) {
      pausedUntil = options.untilISO;
    } else if (options.durationHours) {
      const targetTime = Date.now() + options.durationHours * 60 * 60 * 1000;
      pausedUntil = new Date(targetTime).toISOString();
    }

    this.updateAd(adId, {
      active: true, // Keep active flag, but pausedUntil suppresses it
      pausedUntil,
      pauseReason: options.reason || 'Paused by administrator',
    });
  }

  /**
   * Resume a paused ad immediately
   */
  public resumeAd(adId: string) {
    this.updateAd(adId, {
      active: true,
      pausedUntil: undefined,
      pauseReason: undefined,
    });
  }

  /**
   * Duplicate an existing ad to easily create variations
   */
  public async duplicateAd(adId: string): Promise<AppAd | null> {
    const current = this.getAds();
    const source = current.find((a) => a.id === adId);
    if (!source) return null;

    const copyData: Omit<AppAd, 'id' | 'createdAt' | 'clicksCount' | 'impressionsCount'> = {
      title: `${source.title} (Copy)`,
      description: source.description,
      targetPage: source.targetPage,
      targetPages: source.targetPages,
      placement: source.placement,
      badgeText: source.badgeText,
      imageUrl: source.imageUrl,
      ctaText: source.ctaText,
      ctaUrl: source.ctaUrl,
      active: false, // Start copies in paused / draft mode
      startDate: source.startDate,
      expiresAt: source.expiresAt,
      delaySeconds: source.delaySeconds,
      frequency: source.frequency,
      cardTheme: source.cardTheme,
      bgColor: source.bgColor,
      textColor: source.textColor,
      accentColor: source.accentColor,
      cardFont: source.cardFont,
      titleSize: source.titleSize,
      bodySize: source.bodySize,
      textAlign: source.textAlign,
      cardLayout: source.cardLayout,
      iconBadge: source.iconBadge,
      subtitlePrice: source.subtitlePrice,
      bulletPoints: source.bulletPoints ? [...source.bulletPoints] : undefined,
      cardRadius: source.cardRadius,
      cardWidth: source.cardWidth,
      themeColor: source.themeColor,
    };

    return await this.createAd(copyData, false);
  }

  /**
   * Reset stats for an ad campaign
   */
  public resetAdStats(adId: string) {
    this.updateAd(adId, {
      impressionsCount: 0,
      clicksCount: 0,
    });
  }

  public recordAdImpression(adId: string) {
    const current = this.getAds();
    const updated = current.map((ad) => {
      if (ad.id === adId) {
        return { ...ad, impressionsCount: (ad.impressionsCount || 0) + 1 };
      }
      return ad;
    });
    this.saveAds(updated, false);
  }

  public recordAdClick(adId: string) {
    const current = this.getAds();
    const updated = current.map((ad) => {
      if (ad.id === adId) {
        return { ...ad, clicksCount: (ad.clicksCount || 0) + 1 };
      }
      return ad;
    });
    this.saveAds(updated, false);
  }

  public dismissAd(adId: string, userId: string) {
    const current = this.getAds();
    const updated = current.map((ad) => {
      if (ad.id === adId) {
        const dismissedBy = ad.dismissedBy || [];
        if (!dismissedBy.includes(userId)) {
          return { ...ad, dismissedBy: [...dismissedBy, userId] };
        }
      }
      return ad;
    });
    this.saveAds(updated);
  }

  // Dual sync from Firestore to local cache
  public async fetchCloudSync() {
    try {
      if (!db) return;
      const notifSnap = await getDocs(collection(db, 'notifications'));
      if (!notifSnap.empty) {
        const cloudNotifs: AppNotification[] = [];
        notifSnap.forEach((d) => {
          if (
            d.id.startsWith('notif-streak-') ||
            d.id.startsWith('notif-vocab-') ||
            d.id.startsWith('notif-goal-') ||
            d.id.startsWith('notif-practice-') ||
            d.id.startsWith('notif-writing-') ||
            d.id.startsWith('notif-boost-')
          ) {
            deleteDoc(doc(db, 'notifications', d.id)).catch(() => {});
          } else {
            cloudNotifs.push({ ...(d.data() as AppNotification), id: d.id });
          }
        });
        if (cloudNotifs.length > 0) {
          // Merge local and cloud by ID
          const local = this.getNotifications();
          const map = new Map<string, AppNotification>();
          [...local, ...cloudNotifs].forEach((n) => map.set(n.id, n));
          this.saveNotifications(Array.from(map.values()));
        } else {
          this.saveNotifications([]);
        }
      }

      const adsSnap = await getDocs(collection(db, 'ads'));
      if (!adsSnap.empty) {
        const cloudAds: AppAd[] = [];
        adsSnap.forEach((d) => {
          if (
            d.id.startsWith('ad-fluent-mastery-') ||
            d.id.startsWith('ad-reader-booster-')
          ) {
            deleteDoc(doc(db, 'ads', d.id)).catch(() => {});
          } else {
            cloudAds.push({ ...(d.data() as AppAd), id: d.id });
          }
        });
        if (cloudAds.length > 0) {
          const local = this.getAds();
          const map = new Map<string, AppAd>();
          [...local, ...cloudAds].forEach((a) => map.set(a.id, a));
          this.saveAds(Array.from(map.values()));
        } else {
          this.saveAds([]);
        }
      }
    } catch (e) {
      console.warn('Cloud sync error (using local storage):', e);
    }
  }
}

export const notificationManager = new NotificationManager();
