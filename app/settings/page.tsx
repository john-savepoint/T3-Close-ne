"use client"

import { MemorySettings } from "@/components/memory-settings"
import { TemporaryChatSettings } from "@/components/temporary-chat-settings"
import { TeamManagementDashboard } from "@/components/team-management-dashboard"
import { ApiKeyManager } from "@/components/api-key-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Brain, EyeOff, ExternalLink, Users, Gift, Key, GitCommit, CreditCard, Keyboard, User } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-mauve-subtle/70">
              Manage your T3Chat preferences and privacy settings
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/changelog">
              <Button variant="outline" size="sm">
                <GitCommit className="mr-2 h-4 w-4" />
                Changelog
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="memory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9 bg-mauve-dark/50">
            <TabsTrigger value="memory">
              <Brain className="mr-2 h-4 w-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="temporary">
              <EyeOff className="mr-2 h-4 w-4" />
              Temporary
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="mr-2 h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="gifts">
              <Gift className="mr-2 h-4 w-4" />
              Gifts
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <FileText className="mr-2 h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="shortcuts">
              <Keyboard className="mr-2 h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memory">
            <MemorySettings />
          </TabsContent>

          <TabsContent value="temporary">
            <TemporaryChatSettings />
          </TabsContent>

          <TabsContent value="team">
            <TeamManagementDashboard />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="gifts">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Gift className="h-5 w-5 text-pink-400" />
                  Gift Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-mauve-subtle/70">
                  Share the power of T3Chat with friends, family, and colleagues through gift
                  subscriptions.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-mauve-subtle/70">Gifts Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-mauve-subtle/70">Gifts Redeemed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">$0</div>
                    <div className="text-sm text-mauve-subtle/70">Total Gifted</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Gift Activity</h4>
                  <div className="rounded-lg border border-mauve-dark bg-mauve-surface/30 p-6 text-center">
                    <Gift className="mx-auto mb-4 h-8 w-8 text-mauve-subtle/50" />
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      No gift activity yet
                    </h4>
                    <p className="text-xs text-mauve-subtle/70">
                      Start by sending your first gift to see activity here
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 border-pink-500/50 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 hover:from-pink-500/30 hover:to-purple-600/30">
                    <Gift className="mr-2 h-4 w-4" />
                    Send a Gift
                  </Button>
                  <Link href="/redeem">
                    <Button variant="outline" className="flex-1">
                      Redeem Gift Code
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  Attachment Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-mauve-subtle/70">
                  Manage your file library, view usage statistics, and configure upload preferences.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-mauve-subtle/70">Total Files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0 MB</div>
                    <div className="text-sm text-mauve-subtle/70">Storage Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">-</div>
                    <div className="text-sm text-mauve-subtle/70">Avg. Reuse Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Supported File Types</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      Documents (.pdf, .docx, .pptx)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Code (.ts, .js, .py, .rs, .cpp)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Data (.xlsx, .csv, .json, .xml)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Images (.png, .jpg, .svg)
                    </Badge>
                  </div>
                </div>

                <Link href="/settings/attachments">
                  <Button className="w-full bg-mauve-accent/20 hover:bg-mauve-accent/30">
                    <FileText className="mr-2 h-4 w-4" />
                    Open Attachment Library
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-mauve-subtle/70">
                  Manage your subscription plan, view usage, and update billing information.
                </p>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Free Plan</h4>
                      <p className="mt-1 text-sm text-mauve-subtle/70">
                        You're currently on the free plan with 5 messages per day.
                      </p>
                      <p className="mt-2 text-sm font-medium text-blue-400">
                        Upgrade to Pro for unlimited messages and premium features!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">3/5</div>
                    <div className="text-sm text-mauve-subtle/70">Messages Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">Free</div>
                    <div className="text-sm text-mauve-subtle/70">Current Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">$0</div>
                    <div className="text-sm text-mauve-subtle/70">Monthly Cost</div>
                  </div>
                </div>

                <Link href="/settings/billing">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Plans & Upgrade
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-mauve-subtle/70">
                  Master Z6Chat with these keyboard shortcuts for faster navigation and control.
                </p>

                {/* Global Shortcuts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Global Shortcuts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Open Model Switcher</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">⌘K</Badge>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+K</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Open Command Palette</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">⌘⇧P</Badge>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+Shift+P</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">New Chat</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">⌘N</Badge>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+N</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Shortcuts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Navigation (Vim-style)</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Navigate to Next Message</span>
                      <Badge variant="outline" className="font-mono text-xs">J</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Navigate to Previous Message</span>
                      <Badge variant="outline" className="font-mono text-xs">K</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Navigate Lists (Alternative)</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+N</Badge>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+P</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Shortcuts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Chat Actions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Copy Message</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">⌘C</Badge>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+C</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Edit Last Message</span>
                      <Badge variant="outline" className="font-mono text-xs">↑</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Stop Generation</span>
                      <Badge variant="outline" className="font-mono text-xs">Esc</Badge>
                    </div>
                  </div>
                </div>

                {/* Command Palette */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Command Palette Navigation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Navigate Down</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">J</Badge>
                        <Badge variant="outline" className="font-mono text-xs">↓</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Navigate Up</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="font-mono text-xs">K</Badge>
                        <Badge variant="outline" className="font-mono text-xs">↑</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Select Item</span>
                      <Badge variant="outline" className="font-mono text-xs">Enter</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 px-3 py-2">
                      <span className="text-sm text-mauve-subtle/90">Close</span>
                      <Badge variant="outline" className="font-mono text-xs">Esc</Badge>
                    </div>
                  </div>
                </div>

                <Alert className="border-purple-500/20 bg-purple-500/10">
                  <Keyboard className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-purple-300">
                    <strong>Pro Tip:</strong> Vim keybindings (J/K) work in command palette and message navigation for faster keyboard-only control.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Profile & Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                      <span className="text-2xl font-bold text-white">JD</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-medium text-foreground">John Doe</h4>
                      <p className="text-sm text-mauve-subtle/70">john.doe@example.com</p>
                      <Badge variant="outline" className="text-xs">
                        Free Plan
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Account Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 p-3">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Email Address</h4>
                        <p className="text-xs text-mauve-subtle/70">john.doe@example.com</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 p-3">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Password</h4>
                        <p className="text-xs text-mauve-subtle/70">Last changed 30 days ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 p-3">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication</h4>
                        <p className="text-xs text-mauve-subtle/70">Not enabled</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900">
                          <span className="text-xs font-bold text-white">G</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">GitHub</h4>
                          <p className="text-xs text-mauve-subtle/70">Not connected</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-mauve-dark bg-mauve-dark/30 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                          <span className="text-xs font-bold text-white">G</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Google</h4>
                          <p className="text-xs text-mauve-subtle/70">Connected as john.doe@gmail.com</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Account Actions</h3>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <h4 className="mb-2 text-sm font-medium text-foreground">Danger Zone</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                        Export All Data
                      </Button>
                      <Button variant="outline" size="sm" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Account Created</p>
                      <p className="text-xs text-mauve-subtle/70">June 1, 2024 • Member for 18 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
