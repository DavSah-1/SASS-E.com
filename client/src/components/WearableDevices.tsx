import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Smartphone, RefreshCw, Unplug, CheckCircle2, XCircle, Clock } from "lucide-react";

export function WearableDevices() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: connections, refetch: refetchConnections } = trpc.wearable.getConnections.useQuery();
  const { data: providers } = trpc.wearable.getSupportedProviders.useQuery();
  
  const addConnectionMutation = trpc.wearable.addConnection.useMutation({
    onSuccess: () => {
      toast.success("Device connected successfully!");
      refetchConnections();
      setSelectedProvider(null);
      setIsConnecting(false);
    },
    onError: (error) => {
      toast.error(`Failed to connect device: ${error.message}`);
      setIsConnecting(false);
    },
  });

  const disconnectMutation = trpc.wearable.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Device disconnected");
      refetchConnections();
    },
    onError: (error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  const syncMutation = trpc.wearable.syncData.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        refetchConnections();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const handleConnect = (providerId: string) => {
    setIsConnecting(true);
    setSelectedProvider(providerId);
    
    // Simulate connection process
    setTimeout(() => {
      addConnectionMutation.mutate({
        provider: providerId as any,
        deviceName: providers?.find(p => p.id === providerId)?.name,
      });
    }, 1000);
  };

  const handleDisconnect = (connectionId: number) => {
    if (confirm("Are you sure you want to disconnect this device?")) {
      disconnectMutation.mutate({ connectionId });
    }
  };

  const handleSync = (connectionId: number) => {
    syncMutation.mutate({
      connectionId,
      dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes"],
    });
  };

  const getProviderById = (providerId: string) => {
    return providers?.find(p => p.id === providerId);
  };

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      {connections && connections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Devices</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((connection) => {
              const provider = getProviderById(connection.provider);
              return (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{provider?.icon || "⌚"}</span>
                        <div>
                          <CardTitle className="text-base">{connection.deviceName || provider?.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">{connection.provider.replace("_", " ")}</CardDescription>
                        </div>
                      </div>
                      {connection.isActive ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {connection.lastSyncAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last synced: {new Date(connection.lastSyncAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(connection.id)}
                        disabled={!connection.isActive || syncMutation.isPending}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Unplug className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connect New Device</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers?.map((provider) => {
            const isConnected = connections?.some(c => c.provider === provider.id && c.isActive);
            
            return (
              <Card key={provider.id} className={isConnected ? "opacity-50" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{provider.icon}</span>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <CardDescription className="text-xs">{provider.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <strong>Syncs:</strong> {provider.dataTypes.slice(0, 3).join(", ")}
                    {provider.dataTypes.length > 3 && ` +${provider.dataTypes.length - 3} more`}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={isConnected || isConnecting}
                        onClick={() => setSelectedProvider(provider.id)}
                      >
                        <Smartphone className="h-4 w-4 mr-1" />
                        {isConnected ? "Already Connected" : "Connect"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-2xl">{provider.icon}</span>
                          Connect {provider.name}
                        </DialogTitle>
                        <DialogDescription>
                          {provider.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <h4 className="font-semibold mb-2">Data to Sync</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.dataTypes.map((dataType) => (
                              <Badge key={dataType} variant="secondary" className="capitalize">
                                {dataType.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {provider.supportsOAuth ? (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              This device requires OAuth authorization. You'll be redirected to {provider.name} to grant permissions.
                            </p>
                            <Button
                              onClick={() => handleConnect(provider.id)}
                              disabled={isConnecting}
                              className="w-full"
                            >
                              {isConnecting ? "Connecting..." : `Authorize ${provider.name}`}
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              {provider.id === "apple_health" 
                                ? "Apple Health data can be synced directly from your iPhone using the Health app's sharing features."
                                : "This device can be connected manually through the app settings."}
                            </p>
                            <Button
                              onClick={() => handleConnect(provider.id)}
                              disabled={isConnecting}
                              className="w-full"
                            >
                              {isConnecting ? "Connecting..." : "Connect Device"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Wearable Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Connect your wearable devices to automatically sync health data including steps, heart rate, sleep patterns, and weight measurements.
          </p>
          <p>
            Your data is securely stored and only accessible by you. You can disconnect devices at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
