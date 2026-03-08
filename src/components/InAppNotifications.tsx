import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, Clock, AlertCircle, Info, CreditCard, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type NotificationType = "success" | "info" | "warning" | "error";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: "enrollment" | "payment" | "training" | "info";
  action?: { label: string; href: string };
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clearAll: () => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useAppNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useAppNotifications must be used within NotificationProvider");
  return ctx;
};

const STORAGE_KEY = "alinvest_notifications";

function loadPersistedNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return [];
  }
}

function persistNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
  } catch {
    // quota exceeded
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadPersistedNotifications);

  useEffect(() => {
    persistNotifications(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notif: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 30));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

const typeConfig: Record<NotificationType, { color: string; bg: string; icon: typeof CheckCircle }> = {
  success: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: CheckCircle },
  info: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: Info },
  warning: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", icon: Clock },
  error: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", icon: AlertCircle },
};

const iconMap = {
  enrollment: GraduationCap,
  payment: CreditCard,
  training: GraduationCap,
  info: Info,
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Agora mesmo";
  if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)}h`;
  return date.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll, dismiss } = useAppNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-foreground/70" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[420px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-heading font-semibold text-sm">Notificações</h3>
                <div className="flex gap-1">
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 px-2 text-muted-foreground">
                      Limpar tudo
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Sem notificações</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = typeConfig[notif.type];
                    const IconComponent = notif.icon ? iconMap[notif.icon] : config.icon;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                          !notif.read ? config.bg : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 ${config.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">{formatTimeAgo(notif.timestamp)}</span>
                              {notif.action && (
                                <a
                                  href={notif.action.href}
                                  className="text-[10px] font-medium text-accent hover:underline"
                                >
                                  {notif.action.label}
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => dismiss(notif.id)}
                            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Floating toast-style notification that appears temporarily */
export function NotificationToast() {
  const { notifications } = useAppNotifications();
  const [visible, setVisible] = useState<AppNotification | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].id !== lastId) {
      const latest = notifications[0];
      setVisible(latest);
      setLastId(latest.id);
      const timer = setTimeout(() => setVisible(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, lastId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed top-4 left-1/2 z-[100] w-[90vw] max-w-md"
        >
          <div className={`${typeConfig[visible.type].bg} border border-border rounded-xl shadow-lg px-4 py-3 flex items-start gap-3`}>
            <div className={`mt-0.5 ${typeConfig[visible.type].color}`}>
              {(() => {
                const Icon = visible.icon ? iconMap[visible.icon] : typeConfig[visible.type].icon;
                return <Icon className="w-5 h-5" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{visible.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{visible.message}</p>
            </div>
            <button onClick={() => setVisible(null)} className="shrink-0 p-1 rounded hover:bg-muted/50">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
