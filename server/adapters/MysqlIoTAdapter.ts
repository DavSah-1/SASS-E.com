/**
 * MysqlIoTAdapter
 * 
 * MySQL implementation of IoTAdapter - delegates to db.ts functions
 */

import * as db from '../db';
import type { IoTAdapter } from './IoTAdapter';

export class MysqlIoTAdapter implements IoTAdapter {
  async addIoTDevice(device: any): Promise<void> {
    await db.addIoTDevice(device);
  }

  async getUserIoTDevices(userId: number): Promise<any[]> {
    return db.getUserIoTDevices(userId);
  }

  async getIoTDeviceById(deviceId: string): Promise<any | undefined> {
    return db.getIoTDeviceById(deviceId);
  }

  async updateIoTDeviceState(deviceId: string, state: string, status: string = "online"): Promise<void> {
    await db.updateIoTDeviceState(deviceId, state, status);
  }

  async deleteIoTDevice(deviceId: string): Promise<void> {
    await db.deleteIoTDevice(deviceId);
  }

  async saveIoTCommand(command: any): Promise<void> {
    await db.saveIoTCommand(command);
  }

  async getDeviceCommandHistory(deviceId: string, limit: number = 50): Promise<any[]> {
    return db.getDeviceCommandHistory(deviceId, limit);
  }
}
