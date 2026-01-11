import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import type { CMRSeasonSummary } from '../types';

export class CMRSeasonService extends BaseService<CMRSeasonSummary> {
  constructor() {
    super('cmr_season_summary');
  }

  async getOrCreateSeason(season: string): Promise<CMRSeasonSummary> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return existing;
    }

    const { data: newSeason, error: createError } = await supabase
      .from(this.tableName)
      .insert({
        user_id: userId,
        season,
        paddy_received_qtls: 0,
        resultant_cmr_qtls: 0,
        paddy_balance_qtls: 0,
        cmr_balance_qtls: 0,
        cmr_delivered_fci_raw: 0,
        cmr_delivered_fci_boiled: 0,
        cmr_delivered_central_pool: 0,
        cmr_delivered_state_pool: 0,
        paddy_delivered_fci_raw: 0,
        paddy_delivered_fci_boiled: 0,
        paddy_delivered_central_pool: 0,
        paddy_delivered_state_pool: 0,
        acks_fci: 0,
        acks_central_pool: 0,
        acks_state_pool: 0,
        gate_in_fci: 0,
        gate_in_central_pool: 0,
        gate_in_state_pool: 0,
        pending_dumping_ds_fci: 0,
        pending_dumping_ds_central_pool: 0,
        pending_dumping_ds_state_pool: 0,
        pending_dumping_md_fci: 0,
        pending_dumping_md_central_pool: 0,
        pending_dumping_md_state_pool: 0,
        notes: ''
      })
      .select()
      .single();

    if (createError) throw createError;
    return newSeason;
  }

  async updateSeasonData(season: string, data: Partial<CMRSeasonSummary>): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('season', season);

    if (error) throw error;
  }

  async getAllSeasons(): Promise<CMRSeasonSummary[]> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('season', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async recalculateSeasonSummary(season: string): Promise<CMRSeasonSummary> {
    const userId = await this.getUserId();

    const { data: receipts } = await supabase
      .from('cmr_paddy_receipts')
      .select('paddy_quantity_qtls')
      .eq('user_id', userId)
      .eq('season', season);

    const totalPaddyReceived = (receipts || []).reduce((sum, r) => sum + (r.paddy_quantity_qtls || 0), 0);
    const expectedCMR = totalPaddyReceived * 0.67;

    const { data: deliveries } = await supabase
      .from('cmr_deliveries')
      .select('*')
      .eq('user_id', userId)
      .eq('season', season);

    let cmr_fci_raw = 0, cmr_fci_boiled = 0, cmr_central = 0, cmr_state = 0;
    let paddy_fci_raw = 0, paddy_fci_boiled = 0, paddy_central = 0, paddy_state = 0;
    let acks_fci = 0, acks_central = 0, acks_state = 0;
    let gate_in_fci = 0, gate_in_central = 0, gate_in_state = 0;
    let pending_ds_fci = 0, pending_ds_central = 0, pending_ds_state = 0;
    let pending_md_fci = 0, pending_md_central = 0, pending_md_state = 0;

    (deliveries || []).forEach(d => {
      const pool = d.destination_pool;
      const variety = d.variety;
      const cmr = d.cmr_quantity_qtls || 0;
      const paddy = d.paddy_consumed_qtls || 0;

      if (pool === 'fci') {
        acks_fci++;
        if (variety === 'raw') {
          cmr_fci_raw += cmr;
          paddy_fci_raw += paddy;
        } else {
          cmr_fci_boiled += cmr;
          paddy_fci_boiled += paddy;
        }
        if (d.gate_in_status) gate_in_fci++;
        if (d.dumping_status === 'pending_ds') pending_ds_fci++;
        if (d.dumping_status === 'pending_md') pending_md_fci++;
      } else if (pool === 'central') {
        acks_central++;
        cmr_central += cmr;
        paddy_central += paddy;
        if (d.gate_in_status) gate_in_central++;
        if (d.dumping_status === 'pending_ds') pending_ds_central++;
        if (d.dumping_status === 'pending_md') pending_md_central++;
      } else if (pool === 'state') {
        acks_state++;
        cmr_state += cmr;
        paddy_state += paddy;
        if (d.gate_in_status) gate_in_state++;
        if (d.dumping_status === 'pending_ds') pending_ds_state++;
        if (d.dumping_status === 'pending_md') pending_md_state++;
      }
    });

    const totalPaddyDelivered = paddy_fci_raw + paddy_fci_boiled + paddy_central + paddy_state;
    const totalCMRDelivered = cmr_fci_raw + cmr_fci_boiled + cmr_central + cmr_state;

    const summaryData = {
      paddy_received_qtls: totalPaddyReceived,
      resultant_cmr_qtls: expectedCMR,
      paddy_balance_qtls: totalPaddyReceived - totalPaddyDelivered,
      cmr_balance_qtls: expectedCMR - totalCMRDelivered,
      cmr_delivered_fci_raw: cmr_fci_raw,
      cmr_delivered_fci_boiled: cmr_fci_boiled,
      cmr_delivered_central_pool: cmr_central,
      cmr_delivered_state_pool: cmr_state,
      paddy_delivered_fci_raw: paddy_fci_raw,
      paddy_delivered_fci_boiled: paddy_fci_boiled,
      paddy_delivered_central_pool: paddy_central,
      paddy_delivered_state_pool: paddy_state,
      acks_fci,
      acks_central_pool: acks_central,
      acks_state_pool: acks_state,
      gate_in_fci,
      gate_in_central_pool: gate_in_central,
      gate_in_state_pool: gate_in_state,
      pending_dumping_ds_fci: pending_ds_fci,
      pending_dumping_ds_central_pool: pending_ds_central,
      pending_dumping_ds_state_pool: pending_ds_state,
      pending_dumping_md_fci: pending_md_fci,
      pending_dumping_md_central_pool: pending_md_central,
      pending_dumping_md_state_pool: pending_md_state,
      last_updated: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('user_id', userId)
      .eq('season', season)
      .maybeSingle();

    if (existing) {
      await supabase
        .from(this.tableName)
        .update({ ...summaryData, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('season', season);
    } else {
      await supabase
        .from(this.tableName)
        .insert({ ...summaryData, user_id: userId, season });
    }

    const summary = await this.getOrCreateSeason(season);
    return { ...summary, ...summaryData };
  }

  async getSeasonSummary(season: string): Promise<CMRSeasonSummary> {
    return await this.recalculateSeasonSummary(season);
  }

  async initializeBaselineData(season: string = 'Rabi 24-25'): Promise<void> {
    const userId = await this.getUserId();

    const { data: existingReceipts } = await supabase
      .from('cmr_paddy_receipts')
      .select('id')
      .eq('user_id', userId)
      .eq('season', season)
      .limit(1);

    if (existingReceipts && existingReceipts.length > 0) {
      return;
    }

    await supabase
      .from('cmr_paddy_receipts')
      .insert({
        user_id: userId,
        season,
        receipt_date: '2026-01-10',
        paddy_quantity_qtls: 63090.40,
        paddy_bags: 0,
        gunnies_received: 0,
        vehicle_number: 'BASELINE',
        supplier: 'Opening Balance',
        notes: 'Baseline paddy stock as on 2026-01-10'
      });

    const fullACKs = 97;
    const fullACKCMR = 290.00;
    const fullACKPaddy = 426.47;
    const partialACKCMR = 221.45;
    const partialACKPaddy = 325.72;

    for (let i = 1; i <= fullACKs; i++) {
      await supabase
        .from('cmr_deliveries')
        .insert({
          user_id: userId,
          season,
          delivery_date: '2026-01-10',
          ack_number: `BASELINE-FCI-${i.toString().padStart(3, '0')}`,
          destination_pool: 'fci',
          variety: 'boiled',
          cmr_quantity_qtls: fullACKCMR,
          paddy_consumed_qtls: fullACKPaddy,
          vehicle_number: '',
          driver_name: '',
          delivery_status: 'delivered',
          gate_in_status: true,
          gate_in_date: '2026-01-10',
          dumping_status: 'completed',
          notes: 'Baseline delivery as on 2026-01-10'
        });
    }

    await supabase
      .from('cmr_deliveries')
      .insert({
        user_id: userId,
        season,
        delivery_date: '2026-01-10',
        ack_number: 'BASELINE-FCI-098',
        destination_pool: 'fci',
        variety: 'boiled',
        cmr_quantity_qtls: partialACKCMR,
        paddy_consumed_qtls: partialACKPaddy,
        vehicle_number: '',
        driver_name: '',
        delivery_status: 'delivered',
        gate_in_status: true,
        gate_in_date: '2026-01-10',
        dumping_status: 'completed',
        notes: 'Baseline delivery as on 2026-01-10'
      });
  }

  calculateTotals(summary: CMRSeasonSummary) {
    return {
      totalCMRDelivered:
        summary.cmr_delivered_fci_raw +
        summary.cmr_delivered_fci_boiled +
        summary.cmr_delivered_central_pool +
        summary.cmr_delivered_state_pool,
      totalPaddyDelivered:
        summary.paddy_delivered_fci_raw +
        summary.paddy_delivered_fci_boiled +
        summary.paddy_delivered_central_pool +
        summary.paddy_delivered_state_pool,
      totalACKs:
        summary.acks_fci +
        summary.acks_central_pool +
        summary.acks_state_pool,
      totalGateIn:
        summary.gate_in_fci +
        summary.gate_in_central_pool +
        summary.gate_in_state_pool,
      totalPendingDS:
        summary.pending_dumping_ds_fci +
        summary.pending_dumping_ds_central_pool +
        summary.pending_dumping_ds_state_pool,
      totalPendingMD:
        summary.pending_dumping_md_fci +
        summary.pending_dumping_md_central_pool +
        summary.pending_dumping_md_state_pool,
      deliveryProgress: summary.resultant_cmr_qtls > 0
        ? ((summary.cmr_delivered_fci_raw + summary.cmr_delivered_fci_boiled + summary.cmr_delivered_central_pool + summary.cmr_delivered_state_pool) / summary.resultant_cmr_qtls) * 100
        : 0
    };
  }
}
