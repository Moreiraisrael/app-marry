import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const notificationIcons = {
  milestone: '🎯',
  badge_earned: '🏆',
  phase_upgrade: '📈',
  consistency: '⚔️',
  goal_progress: '🎉'
};

export default function MilestoneNotifications({ evolution, onMarkAsRead }) {
  const [dismissed, setDismissed] = useState(new Set());

  const unreadNotifications = evolution?.notifications?.filter(n => !n.read && !dismissed.has(n.id)) || [];

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {unreadNotifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 400, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-1">
                    {notificationIcons[notif.type] || '✨'}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.created_date).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => setDismissed(new Set([...dismissed, notif.id]))}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      setDismissed(new Set([...dismissed, notif.id]));
                      if (onMarkAsRead) onMarkAsRead(notif.id);
                    }}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Okay!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}