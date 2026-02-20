"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import GoldGlow from "@/components/ui/GoldGlow";

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type Team = {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  reportCount: number;
  members: TeamMember[];
};

export default function TeamPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setError(null);
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
      } else {
        setError("Failed to load teams");
      }
    } catch {
      setError("Failed to load teams. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });
      if (res.ok) {
        setNewTeamName("");
        setShowCreate(false);
        await loadTeams();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create team");
      }
    } catch {
      setError("Failed to create team. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite(teamId: string) {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Member invited successfully!");
        setInviteEmail("");
        setInviteTeamId(null);
        await loadTeams();
      } else {
        setMessage(data.error || "Failed to invite");
      }
    } catch {
      setMessage("Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  const inputClass =
    "w-full bg-navy-800 border border-gold-500/15 rounded-sm px-4 py-3 text-cream-100 font-body placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/50 transition-all";

  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 right-0" size="lg" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-cream-100">Team Workspaces</h1>
            <p className="text-cream-300/50 text-sm font-body mt-1">
              Collaborate on research reports with your team
            </p>
          </div>
          <Button variant="filled" size="md" onClick={() => setShowCreate(true)}>
            Create Team
          </Button>
        </div>

        {error && (
          <p className="text-red-400 text-sm font-body mb-4">{error}</p>
        )}

        {message && (
          <p className={`text-sm font-body mb-4 ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}

        {/* Create team form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy-800 border border-gold-500/15 rounded-lg p-6 mb-6"
          >
            <h2 className="font-display text-lg text-cream-100 mb-4">Create a New Team</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name..."
                className={inputClass}
              />
              <Button variant="filled" size="md" loading={creating} onClick={handleCreateTeam}>
                Create
              </Button>
              <Button variant="outline" size="md" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Teams list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-navy-800 border border-gold-500/10 rounded-lg p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-cream-300/50 font-body mb-4">
              You&apos;re not a member of any teams yet.
            </p>
            <Button variant="outline" size="md" onClick={() => setShowCreate(true)}>
              Create Your First Team
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-navy-800 border border-gold-500/15 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl text-cream-100">{team.name}</h3>
                    <p className="text-cream-300/50 text-xs font-body mt-1">
                      {team.memberCount} member{team.memberCount !== 1 ? "s" : ""} · {team.reportCount} report{team.reportCount !== 1 ? "s" : ""} · Your role: {team.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => router.push(`/dashboard?teamId=${team.id}`)}
                    >
                      View Reports
                    </Button>
                    {(team.role === "OWNER" || team.role === "ADMIN") && (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setInviteTeamId(inviteTeamId === team.id ? null : team.id)}
                      >
                        Invite
                      </Button>
                    )}
                  </div>
                </div>

                {/* Member list */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className="bg-navy-950 text-cream-300/60 text-xs font-body px-2 py-1 rounded"
                    >
                      {m.name || m.email} ({m.role.toLowerCase()})
                    </span>
                  ))}
                </div>

                {/* Invite form */}
                {inviteTeamId === team.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-3 mt-4 pt-4 border-t border-gold-500/10"
                  >
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="member@example.com"
                      className={inputClass}
                    />
                    <Button
                      variant="filled"
                      size="md"
                      loading={inviting}
                      onClick={() => handleInvite(team.id)}
                    >
                      Send Invite
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
