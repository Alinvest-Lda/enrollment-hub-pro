import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "enrollment" | "training_request";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const channel = supabase
      .channel("backoffice-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "enrollments" },
        (payload) => {
          const row = payload.new as any;
          const notif: Notification = {
            id: `enr-${row.id}`,
            type: "enrollment",
            title: "Nova Inscrição",
            description: `${row.full_name} inscreveu-se em ${row.course_name}`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 50));
          toast({
            title: "🔔 Nova Inscrição",
            description: notif.description,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "training_requests" },
        (payload) => {
          const row = payload.new as any;
          const notif: Notification = {
            id: `tr-${row.id}`,
            type: "training_request",
            title: "Novo Pedido de Formação",
            description: `${row.full_name} solicitou formação em ${row.training_topic}`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 50));
          toast({
            title: "🔔 Novo Pedido de Formação",
            description: notif.description,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setOpen(false);
  }, []);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-card border border-border rounded-lg shadow-card-hover z-50 max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-heading font-semibold text-sm">Notificações</h3>
            <div className="flex gap-1">
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 px-2">
                  Limpar
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Sem notificações recentes
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-border last:border-0 ${
                    !notif.read ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={notif.type === "enrollment" ? "default" : "secondary"}
                      className="text-[10px] mt-0.5 shrink-0"
                    >
                      {notif.type === "enrollment" ? "Inscrição" : "Formação"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {notif.timestamp.toLocaleTimeString("pt-MZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;
