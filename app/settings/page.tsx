"use client";

import { motion } from "framer-motion";
import { User, Sliders, Bell, AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize your ExamGhost experience, manage preferences, and update your profile.',
  robots: { index: true, follow: true },
}

const diffs = ["Easy", "Medium", "Hard"] as const;

function Section({ icon: Icon, title, children, delay = 0 }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("Aditya Verma");
  const [email, setEmail] = useState("aditya@example.com");
  const [voice, setVoice] = useState(true);
  const { theme, setTheme } = useTheme();
  const [defaultDiff, setDefaultDiff] = useState<(typeof diffs)[number]>("Medium");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weekly, setWeekly] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("examghost:name");
    if (storedName) setName(storedName);
  }, []);

  return (
    <PageShell>
      <div className="flex flex-col gap-5">
        <PageHeader title="Settings" subtitle="Tune ExamGhost to match how you study best." />

        <Section icon={User} title="Profile" delay={0.05}>
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="h-16 w-16 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">A</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer">Change avatar</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background border-border" />
            </div>
          </div>
        </Section>

        <Section icon={Sliders} title="Preferences" delay={0.1}>
          <ul className="divide-y divide-border">
            <li className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-foreground">Dark mode</div>
                <p className="text-xs text-muted-foreground">Easy on the eyes, optimized for late-night study.</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
            </li>
            <li className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-foreground">Voice mode (default)</div>
                <p className="text-xs text-muted-foreground">Read questions aloud and accept spoken answers.</p>
              </div>
              <Switch checked={voice} onCheckedChange={setVoice} />
            </li>
            <li className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-foreground">Default difficulty</div>
                <p className="text-xs text-muted-foreground">New exams will start at this level.</p>
              </div>
              <div className="flex gap-2">
                {diffs.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDefaultDiff(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      defaultDiff === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </Section>

        <Section icon={Bell} title="Notifications" delay={0.15}>
          <ul className="divide-y divide-border">
            <li className="flex items-center justify-between py-3">
              <div className="font-medium text-foreground">Email notifications</div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </li>
            <li className="flex items-center justify-between py-3">
              <div className="font-medium text-foreground">Push notifications</div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </li>
            <li className="flex items-center justify-between py-3">
              <div className="font-medium text-foreground">Weekly progress summary</div>
              <Switch checked={weekly} onCheckedChange={setWeekly} />
            </li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="Account" delay={0.2}>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-border cursor-pointer">Sign out</Button>
            <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger/10 hover:text-danger cursor-pointer">
              Delete account
            </Button>
          </div>
        </Section>
      </div>
    </PageShell>
  );
}