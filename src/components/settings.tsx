'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Moon, Sun, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type ThemeMode = 'light' | 'dark' | 'system';

type SettingsProps = {
  onSettingsChange?: (settings: AppSettings) => void;
};

export type AppSettings = {
  theme: ThemeMode;
  autoSave: boolean;
  codeViewerFontSize: number;
  showLineNumbers: boolean;
  enableSmoothTransitions: boolean;
  sidebarWidth: number;
};

const defaultSettings: AppSettings = {
  theme: 'system',
  autoSave: true,
  codeViewerFontSize: 14,
  showLineNumbers: true,
  enableSmoothTransitions: true,
  sidebarWidth: 16,
};

export function Settings({ onSettingsChange }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSave = () => {
    // Save to localStorage for persistence
    localStorage.setItem('studioflow-settings', JSON.stringify(settings));
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been saved successfully.',
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
    localStorage.removeItem('studioflow-settings');
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover-transition">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto modal-transition">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings & Customization
          </DialogTitle>
          <DialogDescription>
            Customize your StudioFlow experience with these options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme Mode</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value: ThemeMode) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger className="w-36">
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

              <div className="flex items-center justify-between">
                <Label htmlFor="smooth-transitions">Smooth Transitions</Label>
                <Switch
                  id="smooth-transitions"
                  checked={settings.enableSmoothTransitions}
                  onCheckedChange={(checked) => handleSettingChange('enableSmoothTransitions', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Code Editor Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Code Editor</CardTitle>
              <CardDescription>
                Customize how code is displayed and interacted with.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Size: {settings.codeViewerFontSize}px</Label>
                <Slider
                  value={[settings.codeViewerFontSize]}
                  onValueChange={([value]) => handleSettingChange('codeViewerFontSize', value)}
                  min={10}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="line-numbers">Show Line Numbers</Label>
                <Switch
                  id="line-numbers"
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) => handleSettingChange('showLineNumbers', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Layout</CardTitle>
              <CardDescription>
                Adjust the layout and workspace preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sidebar Width: {settings.sidebarWidth}rem</Label>
                <Slider
                  value={[settings.sidebarWidth]}
                  onValueChange={([value]) => handleSettingChange('sidebarWidth', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto-save Progress</Label>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}