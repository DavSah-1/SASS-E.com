/**
 * SupabaseIoTAdapter
 * 
 * Supabase implementation of IoTAdapter with RLS enforcement
 */

import { getSupabaseClient } from '../supabaseClient';
import type { IoTAdapter } from './IoTAdapter';

export class SupabaseIoTAdapter implements IoTAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient() {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async addIoTDevice(device: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('iot_devices')
      .insert({
        user_id: this.userId,
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_type: device.deviceType,
        state: device.state || '{}',
        status: device.status || 'offline',
      });

    if (error) throw new Error(`Supabase addIoTDevice error: ${error.message}`);
  }

  async getUserIoTDevices(userId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase getUserIoTDevices error: ${error.message}`);

    return (data || []).map((d: any) => ({
      id: d.id,
      userId: parseInt(this.userId),
      deviceId: d.device_id,
      deviceName: d.device_name,
      deviceType: d.device_type,
      state: d.state,
      status: d.status,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async getIoTDeviceById(deviceId: string): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('device_id', deviceId)
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getIoTDeviceById error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      deviceId: data.device_id,
      deviceName: data.device_name,
      deviceType: data.device_type,
      state: data.state,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateIoTDeviceState(deviceId: string, state: string, status: string = "online"): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('iot_devices')
      .update({
        state,
        status,
      })
      .eq('device_id', deviceId)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase updateIoTDeviceState error: ${error.message}`);
  }

  async deleteIoTDevice(deviceId: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('iot_devices')
      .delete()
      .eq('device_id', deviceId)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase deleteIoTDevice error: ${error.message}`);
  }

  async saveIoTCommand(command: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('iot_command_history')
      .insert({
        user_id: this.userId,
        device_id: command.deviceId,
        command: command.command,
        result: command.result,
      });

    if (error) throw new Error(`Supabase saveIoTCommand error: ${error.message}`);
  }

  async getDeviceCommandHistory(deviceId: string, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('iot_command_history')
      .select('*')
      .eq('device_id', deviceId)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Supabase getDeviceCommandHistory error: ${error.message}`);

    return (data || []).map((c: any) => ({
      id: c.id,
      userId: parseInt(this.userId),
      deviceId: c.device_id,
      command: c.command,
      result: c.result,
      createdAt: c.created_at,
    }));
  }
}
