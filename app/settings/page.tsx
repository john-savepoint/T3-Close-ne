"use client"

import { MemorySettings } from "@/components/memory-settings"
import { TemporaryChatSettings } from "@/components/temporary-chat-settings"
import { TeamManagementDashboard } from "@/components/team-management-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, EyeOff, ExternalLink, Users, Gift } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-mauve-subtle/70">
              Manage your T3Chat preferences and privacy settings
            </p>
          </div>

          <Tabs defaultValue="memory" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-mauve-dark/50">
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
              <TabsTrigger value="gifts">
                <Gift className="mr-2 h-4 w-4" />
                Gifts
              </TabsTrigger>
              <TabsTrigger value="attachments">
                <FileText className="mr-2 h-4 w-4" />
                Files
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
                    Manage your file library, view usage statistics, and configure upload
                    preferences.
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
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
