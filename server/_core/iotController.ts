/**
 * IoT Device Controller
 * Handles communication with IoT devices via various protocols
 */

export interface DeviceState {
  power?: "on" | "off";
  brightness?: number; // 0-100
  temperature?: number;
  color?: string;
  mode?: string;
  [key: string]: any;
}

export interface DeviceCapabilities {
  supportsPower?: boolean;
  supportsBrightness?: boolean;
  supportsTemperature?: boolean;
  supportsColor?: boolean;
  supportsModes?: string[];
  [key: string]: any;
}

export interface IoTCommand {
  action: string;
  parameters?: Record<string, any>;
}

/**
 * Base IoT Device Controller
 */
export class IoTDeviceController {
  /**
   * Execute a command on an IoT device
   */
  async executeCommand(
    deviceId: string,
    command: IoTCommand,
    connectionType: string,
    connectionConfig: any
  ): Promise<{ success: boolean; message: string; newState?: DeviceState }> {
    try {
      switch (connectionType) {
        case "http":
          return await this.executeHttpCommand(deviceId, command, connectionConfig);
        case "mqtt":
          return await this.executeMqttCommand(deviceId, command, connectionConfig);
        case "websocket":
          return await this.executeWebSocketCommand(deviceId, command, connectionConfig);
        case "local":
          return await this.executeLocalCommand(deviceId, command, connectionConfig);
        default:
          return {
            success: false,
            message: `Unsupported connection type: ${connectionType}`,
          };
      }
    } catch (error) {
      console.error(`Error executing command on device ${deviceId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute HTTP-based command
   */
  private async executeHttpCommand(
    deviceId: string,
    command: IoTCommand,
    config: any
  ): Promise<{ success: boolean; message: string; newState?: DeviceState }> {
    const { endpoint, method = "POST", headers = {} } = config;

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        deviceId,
        ...command,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: "Command executed successfully",
      newState: data.state,
    };
  }

  /**
   * Execute MQTT-based command
   */
  private async executeMqttCommand(
    deviceId: string,
    command: IoTCommand,
    config: any
  ): Promise<{ success: boolean; message: string; newState?: DeviceState }> {
    // MQTT implementation would require mqtt library
    // For now, return a simulated response
    console.log(`MQTT command for ${deviceId}:`, command);
    
    return {
      success: true,
      message: "MQTT command queued (simulated)",
      newState: this.simulateStateChange(command),
    };
  }

  /**
   * Execute WebSocket-based command
   */
  private async executeWebSocketCommand(
    deviceId: string,
    command: IoTCommand,
    config: any
  ): Promise<{ success: boolean; message: string; newState?: DeviceState }> {
    // WebSocket implementation
    console.log(`WebSocket command for ${deviceId}:`, command);
    
    return {
      success: true,
      message: "WebSocket command sent (simulated)",
      newState: this.simulateStateChange(command),
    };
  }

  /**
   * Execute local network command
   */
  private async executeLocalCommand(
    deviceId: string,
    command: IoTCommand,
    config: any
  ): Promise<{ success: boolean; message: string; newState?: DeviceState }> {
    // Local network implementation
    console.log(`Local command for ${deviceId}:`, command);
    
    return {
      success: true,
      message: "Local command executed (simulated)",
      newState: this.simulateStateChange(command),
    };
  }

  /**
   * Simulate state change for demo purposes
   */
  private simulateStateChange(command: IoTCommand): DeviceState {
    const newState: DeviceState = {};

    switch (command.action) {
      case "turn_on":
      case "power_on":
        newState.power = "on";
        break;
      case "turn_off":
      case "power_off":
        newState.power = "off";
        break;
      case "set_brightness":
        newState.brightness = command.parameters?.brightness || 100;
        break;
      case "set_temperature":
        newState.temperature = command.parameters?.temperature || 72;
        break;
      case "set_color":
        newState.color = command.parameters?.color || "#FFFFFF";
        break;
    }

    return newState;
  }

  /**
   * Parse natural language command into IoT command
   */
  parseNaturalLanguageCommand(text: string, deviceType: string): IoTCommand | null {
    const lowerText = text.toLowerCase();

    // Power commands
    if (lowerText.includes("turn on") || lowerText.includes("switch on") || lowerText.includes("power on")) {
      return { action: "turn_on" };
    }
    if (lowerText.includes("turn off") || lowerText.includes("switch off") || lowerText.includes("power off")) {
      return { action: "turn_off" };
    }

    // Brightness commands (for lights)
    if (deviceType === "light") {
      const brightnessMatch = lowerText.match(/(?:set|change|adjust)?\s*brightness\s*(?:to)?\s*(\d+)/i);
      if (brightnessMatch) {
        return {
          action: "set_brightness",
          parameters: { brightness: parseInt(brightnessMatch[1]) },
        };
      }
      if (lowerText.includes("dim") || lowerText.includes("darker")) {
        return { action: "set_brightness", parameters: { brightness: 30 } };
      }
      if (lowerText.includes("bright") || lowerText.includes("brighter")) {
        return { action: "set_brightness", parameters: { brightness: 100 } };
      }
    }

    // Temperature commands (for thermostats)
    if (deviceType === "thermostat") {
      const tempMatch = lowerText.match(/(?:set|change|adjust)?\s*temperature\s*(?:to)?\s*(\d+)/i);
      if (tempMatch) {
        return {
          action: "set_temperature",
          parameters: { temperature: parseInt(tempMatch[1]) },
        };
      }
    }

    // Color commands (for lights)
    if (deviceType === "light") {
      const colorMatch = lowerText.match(/(?:set|change)?\s*color\s*(?:to)?\s*(\w+)/i);
      if (colorMatch) {
        return {
          action: "set_color",
          parameters: { color: colorMatch[1] },
        };
      }
    }

    return null;
  }
}

export const iotController = new IoTDeviceController();

