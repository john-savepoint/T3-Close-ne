"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { EyeOff, Shield, Clock, Info } from "lucide-react"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"

export function TemporaryChatSettings() {
  const { settings, updateSettings } = useTemporaryChat()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <EyeOff className="w-5 h-5" />
          Temporary Chats
        </h3>
        <p className="text-sm text-mauve-subtle/70">Configure how temporary chats behave and what data they include</p>
      </div>

      <div className="space-y-4">
        {/* Privacy Settings */}
        <Card className="bg-mauve-surface/50 border-mauve-dark">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="include-memory" className="text-sm font-medium">
                  Include AI Memory in Temporary Chats
                </Label>
                <p className="text-xs text-mauve-subtle/70">
                  When enabled, your saved memories and preferences will be included in temporary chats
                </p>
              </div>
              <Switch
                id="include-memory"
                checked={settings.includeMemoryInTempChats}
                onCheckedChange={(checked) => updateSettings({ includeMemoryInTempChats: checked })}
              />
            </div>

            {!settings.includeMemoryInTempChats && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <Shield className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>Maximum Privacy:</strong> Temporary chats will not include your personal memories or
                  preferences, ensuring complete anonymity.
                </AlertDescription>
              </Alert>
            )}

            {settings.includeMemoryInTempChats && (
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <Info className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  <strong>Personalized Experience:</strong> The AI will remember your preferences and context, but this
                  reduces privacy in temporary chats.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Auto-Deletion Policy */}
        <Card className="bg-mauve-surface/50 border-mauve-dark">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Auto-Deletion Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-delete" className="text-sm font-medium">
                Delete temporary chats after:
              </Label>
              <Select
                value={settings.autoDeletePolicy}
                onValueChange={(value) => updateSettings({ autoDeletePolicy: value as any })}
              >
                <SelectTrigger className="bg-mauve-dark/50 border-mauve-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-mauve-surface border-mauve-dark">
                  <SelectItem value="session">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-red-400 border-red-500/50">
                        Most Private
                      </Badge>
                      End of session (close tab/browser)
                    </div>
                  </SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-mauve-subtle/70">
                {settings.autoDeletePolicy === "session"
                  ? "Chats are deleted immediately when you close the tab or navigate away"
                  : `Chats are automatically deleted after ${settings.autoDeletePolicy === "24h" ? "24 hours" : settings.autoDeletePolicy === "7d" ? "7 days" : "30 days"}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Warning Settings */}
        <Card className="bg-mauve-surface/50 border-mauve-dark">
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-warnings" className="text-sm font-medium">
                  Show temporary chat warnings
                </Label>
                <p className="text-xs text-mauve-subtle/70">Display reminders that temporary chats are not saved</p>
              </div>
              <Switch
                id="show-warnings"
                checked={settings.showTempChatWarnings}
                onCheckedChange={(checked) => updateSettings({ showTempChatWarnings: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="bg-mauve-surface/50 border-mauve-dark">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-mauve-subtle/70">Temporary chats this week:</span>
                <div className="font-medium">12</div>
              </div>
              <div>
                <span className="text-mauve-subtle/70">Saved to history:</span>
                <div className="font-medium">3</div>
              </div>
              <div>
                <span className="text-mauve-subtle/70">Average duration:</span>
                <div className="font-medium">4.2 minutes</div>
              </div>
              <div>
                <span className="text-mauve-subtle/70">Privacy score:</span>
                <div className="font-medium flex items-center gap-1">
                  <Badge variant="outline" className="text-xs text-green-400 border-green-500/50">
                    High
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
