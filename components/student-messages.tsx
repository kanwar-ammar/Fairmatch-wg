"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type Thread = {
  applicationId: string;
  homeProfileId: string;
  homeTitle: string;
  district: string;
  applicationStatus: string;
  studentName: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    createdAt: string;
  }>;
};

export function StudentMessages() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.applicationId === selectedApplicationId) || null,
    [threads, selectedApplicationId],
  );

  const loadThreads = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/messages?userId=${encodeURIComponent(currentUser.id)}&role=student`,
        { cache: "no-store" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load messages");
      }

      const nextThreads = result.threads || [];
      setThreads(nextThreads);

      if (!selectedApplicationId && nextThreads[0]) {
        setSelectedApplicationId(nextThreads[0].applicationId);
      }

      if (
        selectedApplicationId &&
        !nextThreads.some((thread: Thread) => thread.applicationId === selectedApplicationId)
      ) {
        setSelectedApplicationId(nextThreads[0]?.applicationId || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, [currentUser?.id]);

  const sendMessage = async () => {
    if (!currentUser?.id || !selectedThread) return;

    const text = draft.trim();
    if (!text) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          applicationId: selectedThread.applicationId,
          text,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setDraft("");
      await loadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-2xl lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Application Chats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.applicationId}
                type="button"
                onClick={() => setSelectedApplicationId(thread.applicationId)}
                className={`w-full rounded-xl border p-3 text-left ${
                  selectedApplicationId === thread.applicationId
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <p className="text-sm font-semibold text-foreground line-clamp-1">{thread.homeTitle}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{thread.district}</p>
                <Badge variant="secondary" className="mt-2 rounded-full text-[10px]">
                  {thread.applicationStatus}
                </Badge>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {selectedThread ? selectedThread.homeTitle : "Select a chat"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}

          {selectedThread ? (
            <>
              <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                {selectedThread.messages.map((message) => {
                  const mine = message.senderId === currentUser?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          mine ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-[11px] font-semibold opacity-80">{message.senderName}</p>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="mt-1 text-[10px] opacity-70">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  className="rounded-xl"
                />
                <Button className="rounded-xl gap-2" onClick={() => void sendMessage()} disabled={sending}>
                  <Send className="h-4 w-4" />
                  {sending ? "Sending" : "Send"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a listing chat from the left.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
