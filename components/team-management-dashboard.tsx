"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  Plus,
  Crown,
  Mail,
  Trash2,
  Copy,
  Check,
  Loader2,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { useTeams } from "@/hooks/use-teams"

export function TeamManagementDashboard() {
  const { teams, getTeamMembers, inviteMember, removeMember, loading } = useTeams()
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)

  // For demo, we'll use the first team
  const userTeam = teams[0]
  const teamMembers = userTeam ? getTeamMembers(userTeam.id) : []

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userTeam || !inviteEmail.trim()) return

    try {
      await inviteMember(userTeam.id, inviteEmail.trim())
      setInviteEmail("")
      setIsInviteModalOpen(false)
    } catch (error) {
      alert((error as Error).message || "Failed to send invitation")
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!userTeam) return

    if (confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      try {
        await removeMember(userTeam.id, userId)
      } catch (error) {
        alert((error as Error).message || "Failed to remove member")
      }
    }
  }

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite/${userTeam?.id}`
    await navigator.clipboard.writeText(inviteLink)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  if (!userTeam) {
    return (
      <Card className="bg-mauve-surface/50 border-mauve-dark">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-mauve-subtle/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Team Plan</h3>
          <p className="text-mauve-subtle/70 mb-4">Create a family or team plan to manage multiple subscriptions.</p>
          <Button className="bg-mauve-accent/20 hover:bg-mauve-accent/30">
            <Plus className="w-4 h-4 mr-2" />
            Create Team Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{userTeam.name}</h2>
          <p className="text-sm text-mauve-subtle/70">
            {userTeam.planType === "family" ? "Family Plan" : "Team Plan"} • {userTeam.usedSeats} of {userTeam.maxSeats}{" "}
            seats used
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${
            userTeam.status === "active"
              ? "bg-green-500/20 text-green-400 border-green-500/50"
              : "bg-red-500/20 text-red-400 border-red-500/50"
          }`}
        >
          {userTeam.status}
        </Badge>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-mauve-dark/50">
          <TabsTrigger value="members">
            Members
            <Badge variant="secondary" className="ml-2 h-4 text-xs">
              {teamMembers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Team Overview */}
          <Card className="bg-mauve-surface/50 border-mauve-dark">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-mauve-subtle/70">
                  {userTeam.usedSeats} of {userTeam.maxSeats} seats used
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyInviteLink}>
                    {copiedInvite ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedInvite ? "Copied!" : "Copy Invite Link"}
                  </Button>
                  <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                        disabled={userTeam.usedSeats >= userTeam.maxSeats}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-mauve-surface border-mauve-dark">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Invite Team Member</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="bg-mauve-dark/50 border-mauve-dark"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={loading || !inviteEmail.trim()}
                            className="flex-1 bg-mauve-accent/20 hover:bg-mauve-accent/30"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            Send Invitation
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {userTeam.usedSeats >= userTeam.maxSeats && (
                <Alert className="bg-amber-500/10 border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-300">
                    Your team is at maximum capacity. Remove a member or upgrade your plan to invite more people.
                  </AlertDescription>
                </Alert>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 p-3 bg-mauve-dark/30 rounded-lg border border-mauve-dark"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={member.userName} />
                      <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{member.userName}</span>
                        {member.role === "owner" && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-mauve-subtle/70">{member.userEmail}</div>
                      <div className="text-xs text-mauve-subtle/50">Joined {member.joinedAt.toLocaleDateString()}</div>
                    </div>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveMember(member.userId, member.userName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="bg-mauve-surface/50 border-mauve-dark">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">${userTeam.monthlyPrice}</div>
                  <div className="text-sm text-mauve-subtle/70">Monthly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{userTeam.usedSeats}</div>
                  <div className="text-sm text-mauve-subtle/70">Active Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {userTeam.planType === "family" ? "$9" : "$15"}
                  </div>
                  <div className="text-sm text-mauve-subtle/70">Per Seat</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-mauve-subtle/70">Next billing date:</span>
                  <span className="text-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mauve-subtle/70">Plan type:</span>
                  <span className="text-foreground capitalize">{userTeam.planType} Plan</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Billing History
                </Button>
                <Button variant="outline" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-mauve-surface/50 border-mauve-dark">
            <CardHeader>
              <CardTitle className="text-foreground">Team Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" value={userTeam.name} className="bg-mauve-dark/50 border-mauve-dark" readOnly />
              </div>

              <div className="space-y-2">
                <Label>Plan Details</Label>
                <div className="text-sm text-mauve-subtle/70">
                  <p>Plan Type: {userTeam.planType === "family" ? "Family Plan" : "Team Plan"}</p>
                  <p>Maximum Seats: {userTeam.maxSeats}</p>
                  <p>Created: {userTeam.createdAt.toLocaleDateString()}</p>
                </div>
              </div>

              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  <strong>Danger Zone:</strong> Canceling your team plan will remove Pro access for all members at the
                  end of the current billing cycle.
                </AlertDescription>
              </Alert>

              <Button variant="destructive" className="w-full">
                Cancel Team Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
