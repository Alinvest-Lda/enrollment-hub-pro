import { motion } from "framer-motion";
import { Smartphone, Building2, Banknote } from "lucide-react";
import { Card } from "@/components/ui/card";

export type PaymentMethod = "mpesa" | "emola" | "bank_transfer";

interface PaymentMethodStepProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods = [
  {
    id: "mpesa" as PaymentMethod,
    label: "M-Pesa",
    description: "Pagamento instantâneo via M-Pesa Vodacom",
    icon: Smartphone,
    online: true,
    badge: "Online",
  },
  {
    id: "bank_transfer" as PaymentMethod,
    label: "Transferência Bancária",
    description: "Faça a transferência e envie o comprovativo",
    icon: Building2,
    online: false,
    badge: "Offline",
  },
  {
    id: "emola" as PaymentMethod,
    label: "e-Mola",
    description: "Envie por e-Mola e anexe o comprovativo",
    icon: Banknote,
    online: false,
    badge: "Offline",
  },
];

const PaymentMethodStep = ({ selected, onSelect }: PaymentMethodStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      <p className="text-sm text-muted-foreground mb-4">
        Escolha como pretende efectuar o pagamento:
      </p>

      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;

        return (
          <Card
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`p-4 cursor-pointer transition-all border-2 rounded-xl ${
              isSelected
                ? "border-accent bg-accent/5 shadow-sm"
                : "border-border hover:border-accent/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg transition-colors ${
                  isSelected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-semibold text-sm">{method.label}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                      method.online
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {method.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "border-accent" : "border-muted-foreground/30"
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </div>
            </div>
          </Card>
        );
      })}
    </motion.div>
  );
};

export default PaymentMethodStep;
