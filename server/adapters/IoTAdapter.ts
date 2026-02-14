/**
 * IoTAdapter Interface
 * 
 * Unified interface for IoT device operations across MySQL (admin) and Supabase (user) databases.
 */

export interface IoTAdapter {
  // Device Management
  addIoTDevice(device: any): Promise<void>;
  getUserIoTDevices(userId: number): Promise<any[]>;
  getIoTDeviceById(deviceId: string): Promise<any | undefined>;
  updateIoTDeviceState(deviceId: string, state: string, status?: string): Promise<void>;
  deleteIoTDevice(deviceId: string): Promise<void>;

  // Command History
  saveIoTCommand(command: any): Promise<void>;
  getDeviceCommandHistory(deviceId: string, limit?: number): Promise<any[]>;
}
