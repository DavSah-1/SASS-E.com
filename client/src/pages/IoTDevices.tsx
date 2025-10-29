import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Lightbulb, Thermometer, Plug, Power, Trash2, Plus } from "lucide-react";

export default function IoTDevices() {
  const { user, isAuthenticated } = useAuth();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [voiceCommand, setVoiceCommand] = useState("");

  const { data: devices, refetch } = trpc.iot.listDevices.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addDeviceMutation = trpc.iot.addDevice.useMutation({
    onSuccess: () => {
      toast.success("Device added successfully!");
      setShowAddDevice(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add device: ${error.message}`);
    },
  });

  const controlDeviceMutation = trpc.iot.controlDevice.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setVoiceCommand("");
    },
    onError: (error) => {
      toast.error(`Failed to control device: ${error.message}`);
    },
  });

  const deleteDeviceMutation = trpc.iot.deleteDevice.useMutation({
    onSuccess: () => {
      toast.success("Device deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete device: ${error.message}`);
    },
  });

  const handleAddDevice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addDeviceMutation.mutate({
      deviceId: formData.get("deviceId") as string,
      deviceName: formData.get("deviceName") as string,
      deviceType: formData.get("deviceType") as any,
      manufacturer: formData.get("manufacturer") as string,
      model: formData.get("model") as string,
      connectionType: formData.get("connectionType") as any,
      connectionConfig: {
        endpoint: formData.get("endpoint") as string,
      },
      capabilities: {
        supportsPower: true,
        supportsBrightness: formData.get("deviceType") === "light",
        supportsTemperature: formData.get("deviceType") === "thermostat",
      },
    });
  };

  const handleControlDevice = () => {
    if (!selectedDevice || !voiceCommand) {
      toast.error("Please select a device and enter a command");
      return;
    }

    controlDeviceMutation.mutate({
      deviceId: selectedDevice,
      command: voiceCommand,
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "light":
        return <Lightbulb className="h-6 w-6" />;
      case "thermostat":
        return <Thermometer className="h-6 w-6" />;
      case "plug":
        return <Plug className="h-6 w-6" />;
      default:
        return <Power className="h-6 w-6" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to manage your IoT devices</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">IoT Devices</h1>
          <p className="text-purple-200">
            Manage your smart home devices. Bob will control them... reluctantly.
          </p>
        </div>

        {/* Voice Control Section */}
        <Card className="mb-6 bg-purple-950/50 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white">🎤 Voice Control</CardTitle>
            <CardDescription className="text-purple-300">
              Tell Bob what to do with your devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="device-select" className="text-white">Select Device</Label>
              <Select value={selectedDevice || ""} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device-select" className="bg-purple-900/50 border-purple-700 text-white">
                  <SelectValue placeholder="Choose a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.deviceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="voice-command" className="text-white">Voice Command</Label>
              <Input
                id="voice-command"
                placeholder="e.g., 'turn on the light' or 'set temperature to 72'"
                value={voiceCommand}
                onChange={(e) => setVoiceCommand(e.target.value)}
                className="bg-purple-900/50 border-purple-700 text-white placeholder:text-purple-400"
              />
            </div>

            <Button
              onClick={handleControlDevice}
              disabled={controlDeviceMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {controlDeviceMutation.isPending ? "Executing..." : "Execute Command"}
            </Button>
          </CardContent>
        </Card>

        {/* Devices List */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Your Devices</h2>
          <Button
            onClick={() => setShowAddDevice(!showAddDevice)}
            variant="outline"
            className="border-purple-500 text-purple-200 hover:bg-purple-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Add Device Form */}
        {showAddDevice && (
          <Card className="mb-6 bg-purple-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white">Add New Device</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceId" className="text-white">Device ID</Label>
                    <Input
                      id="deviceId"
                      name="deviceId"
                      required
                      className="bg-purple-900/50 border-purple-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deviceName" className="text-white">Device Name</Label>
                    <Input
                      id="deviceName"
                      name="deviceName"
                      required
                      className="bg-purple-900/50 border-purple-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deviceType" className="text-white">Device Type</Label>
                    <Select name="deviceType" required>
                      <SelectTrigger className="bg-purple-900/50 border-purple-700 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="thermostat">Thermostat</SelectItem>
                        <SelectItem value="plug">Smart Plug</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                        <SelectItem value="sensor">Sensor</SelectItem>
                        <SelectItem value="lock">Lock</SelectItem>
                        <SelectItem value="camera">Camera</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="connectionType" className="text-white">Connection Type</Label>
                    <Select name="connectionType" required>
                      <SelectTrigger className="bg-purple-900/50 border-purple-700 text-white">
                        <SelectValue placeholder="Select connection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="mqtt">MQTT</SelectItem>
                        <SelectItem value="websocket">WebSocket</SelectItem>
                        <SelectItem value="local">Local Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="manufacturer" className="text-white">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      className="bg-purple-900/50 border-purple-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-white">Model</Label>
                    <Input
                      id="model"
                      name="model"
                      className="bg-purple-900/50 border-purple-700 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="endpoint" className="text-white">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      name="endpoint"
                      placeholder="https://api.device.com/control"
                      className="bg-purple-900/50 border-purple-700 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={addDeviceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addDeviceMutation.isPending ? "Adding..." : "Add Device"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDevice(false)}
                    className="border-purple-500 text-purple-200 hover:bg-purple-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices?.map((device) => (
            <Card key={device.deviceId} className="bg-purple-950/50 border-purple-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-purple-400">{getDeviceIcon(device.deviceType)}</div>
                    <CardTitle className="text-white">{device.deviceName}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDeviceMutation.mutate({ deviceId: device.deviceId })}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-purple-300">
                  {device.manufacturer} {device.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-purple-200">
                    <span>Status:</span>
                    <span className={device.status === "online" ? "text-green-400" : "text-gray-400"}>
                      {device.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>Type:</span>
                    <span>{device.deviceType}</span>
                  </div>
                  {device.state?.power && (
                    <div className="flex justify-between text-purple-200">
                      <span>Power:</span>
                      <span className={device.state.power === "on" ? "text-green-400" : "text-gray-400"}>
                        {device.state.power}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {devices?.length === 0 && (
          <Card className="bg-purple-950/50 border-purple-700">
            <CardContent className="py-12 text-center">
              <p className="text-purple-300 text-lg">
                No devices yet. Bob is relieved he doesn't have to control anything.
              </p>
              <p className="text-purple-400 mt-2">
                Click "Add Device" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}

