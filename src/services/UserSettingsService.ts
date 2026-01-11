import { BaseService } from './BaseService';
import type { UserSettings } from '../types';

export class UserSettingsService extends BaseService<UserSettings> {
  constructor() {
    super('user_settings');
  }

  async getSettings(): Promise<UserSettings> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return existing;
    }

    const { data: newSettings, error: createError } = await this.supabase
      .from(this.tableName)
      .insert({
        user_id: userId,
        active_season: 'Rabi 24-25',
        available_seasons: ['Rabi 24-25', 'Kharif 25-26', 'Rabi 25-26', 'Kharif 26-27'],
        settings: {}
      })
      .select()
      .single();

    if (createError) throw createError;
    return newSettings;
  }

  async updateActiveSeason(season: string): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        active_season: season,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  async addSeason(season: string): Promise<void> {
    const userId = await this.getUserId();
    const settings = await this.getSettings();

    if (!settings.available_seasons.includes(season)) {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({
          available_seasons: [...settings.available_seasons, season],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    }
  }
}
