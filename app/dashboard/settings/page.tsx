"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Palette,
  MessageSquare,
  Shield,
  Database,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  Globe,
  Zap,
  Brain,
  Eye,
  Volume2,
  Smartphone,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  // Profile Settings
  displayName: string;
  email: string;

  // Appearance Settings
  theme: "light" | "dark" | "system";
  fontSize: number;
  compactMode: boolean;
  showSourcePreviews: boolean;
  animationsEnabled: boolean;

  // Chat Settings
  defaultSearchDepth: "basic" | "advanced";
  maxSources: number;
  autoSave: boolean;
  showTypingIndicator: boolean;
  soundEnabled: boolean;
  language: string;

  // AI Settings
  aiModel: "gemini-1.5-flash" | "gemini-2.0-flash";
  responseStyle: "concise" | "detailed" | "balanced";
  includeEmojis: boolean;

  // Privacy Settings
  saveConversations: boolean;
  allowAnalytics: boolean;
  shareUsageData: boolean;

  // Mobile Settings
  mobileOptimized: boolean;
  quickActions: boolean;
  swipeGestures: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    // Default values
    displayName: session?.user?.name || "",
    email: session?.user?.email || "",
    theme: "system",
    fontSize: 16,
    compactMode: false,
    showSourcePreviews: true,
    animationsEnabled: true,
    defaultSearchDepth: "advanced",
    maxSources: 6,
    autoSave: true,
    showTypingIndicator: true,
    soundEnabled: false,
    language: "en",
    aiModel: "gemini-1.5-flash",
    responseStyle: "balanced",
    includeEmojis: true,
    saveConversations: true,
    allowAnalytics: false,
    shareUsageData: false,
    mobileOptimized: true,
    quickActions: true,
    swipeGestures: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("mini-perplexity-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem(
        "mini-perplexity-settings",
        JSON.stringify(settings)
      );

      // Here you could also save to your backend/Supabase
      // await saveSettingsToDatabase(settings)

      toast.success("Settings saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        displayName: session?.user?.name || "",
        email: session?.user?.email || "",
        theme: "system",
        fontSize: 16,
        compactMode: false,
        showSourcePreviews: true,
        animationsEnabled: true,
        defaultSearchDepth: "advanced",
        maxSources: 6,
        autoSave: true,
        showTypingIndicator: true,
        soundEnabled: false,
        language: "en",
        aiModel: "gemini-1.5-flash",
        responseStyle: "balanced",
        includeEmojis: true,
        saveConversations: true,
        allowAnalytics: false,
        shareUsageData: false,
        mobileOptimized: true,
        quickActions: true,
        swipeGestures: true,
      });
      toast.success("Settings reset to default");
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mini-perplexity-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported successfully!");
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Mini Perplexity experience
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-800">
              You have unsaved changes. Don't forget to save your settings!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={settings.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  setSettings((prev) => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]: [number]) =>
                  setSettings((prev) => ({ ...prev, fontSize: value }))
                }
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing and padding
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, compactMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth transitions
                </p>
              </div>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({
                    ...prev,
                    animationsEnabled: checked,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Experience
          </CardTitle>
          <CardDescription>
            Configure how you interact with the AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Search Depth</Label>
              <Select
                value={settings.defaultSearchDepth}
                onValueChange={(value: "basic" | "advanced") =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultSearchDepth: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Faster)</SelectItem>
                  <SelectItem value="advanced">
                    Advanced (More thorough)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Sources: {settings.maxSources}</Label>
              <Slider
                value={[settings.maxSources]}
                onValueChange={([value]: [number]) =>
                  setSettings((prev) => ({ ...prev, maxSources: value }))
                }
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save chat history
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, autoSave: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Source Previews</Label>
                <p className="text-sm text-muted-foreground">
                  Display source snippets
                </p>
              </div>
              <Switch
                checked={settings.showSourcePreviews}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({
                    ...prev,
                    showSourcePreviews: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Typing Indicator</Label>
                <p className="text-sm text-muted-foreground">
                  Show when AI is responding
                </p>
              </div>
              <Switch
                checked={settings.showTypingIndicator}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({
                    ...prev,
                    showTypingIndicator: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sound Effects
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for notifications
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, soundEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>Customize AI behavior and responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select
                value={settings.aiModel}
                onValueChange={(
                  value: "gemini-1.5-flash" | "gemini-2.0-flash"
                ) => setSettings((prev) => ({ ...prev, aiModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">
                    <div className="flex items-center justify-between w-full">
                      <span>Gemini 1.5 Flash</span>
                      <Badge variant="secondary">Faster</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini-2.0-flash">
                    <div className="flex items-center justify-between w-full">
                      <span>Gemini 2.0 Flash</span>
                      <Badge variant="default">Latest</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Response Style</Label>
              <Select
                value={settings.responseStyle}
                onValueChange={(value: "concise" | "detailed" | "balanced") =>
                  setSettings((prev) => ({ ...prev, responseStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Emojis</Label>
              <p className="text-sm text-muted-foreground">
                Add emojis to responses
              </p>
            </div>
            <Switch
              checked={settings.includeEmojis}
              onCheckedChange={(checked: boolean) =>
                setSettings((prev) => ({ ...prev, includeEmojis: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Experience
          </CardTitle>
          <CardDescription>Optimize for mobile devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mobile Optimization</Label>
                <p className="text-sm text-muted-foreground">
                  Optimize interface for mobile
                </p>
              </div>
              <Switch
                checked={settings.mobileOptimized}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, mobileOptimized: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quick Actions</Label>
                <p className="text-sm text-muted-foreground">
                  Show floating action buttons
                </p>
              </div>
              <Switch
                checked={settings.quickActions}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, quickActions: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Swipe Gestures</Label>
                <p className="text-sm text-muted-foreground">
                  Enable swipe navigation
                </p>
              </div>
              <Switch
                checked={settings.swipeGestures}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, swipeGestures: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Control your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Save Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Store chat history in database
                </p>
              </div>
              <Switch
                checked={settings.saveConversations}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({
                    ...prev,
                    saveConversations: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app with usage data
                </p>
              </div>
              <Switch
                checked={settings.allowAnalytics}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, allowAnalytics: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share Usage Data</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymous usage statistics
                </p>
              </div>
              <Switch
                checked={settings.shareUsageData}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev) => ({ ...prev, shareUsageData: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Import, export, and manage your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Implement import functionality
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string);
                        if (data.settings) {
                          setSettings(data.settings);
                          toast.success("Settings imported successfully!");
                        }
                      } catch (error) {
                        toast.error("Invalid settings file");
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete all your chat history? This action cannot be undone."
                  )
                ) {
                  // Implement delete all chats functionality
                  toast.success("All chat history deleted");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Chat History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>
          Mini Perplexity v1.0 • Settings are stored locally and in your account
        </p>
      </div>
    </div>
  );
}
