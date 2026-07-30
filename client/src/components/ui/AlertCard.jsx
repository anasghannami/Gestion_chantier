import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#D97706]/10',
    border: 'border-l-[#D97706]',
    iconColor: 'text-[#D97706]',
    titleColor: 'text-[#FDE68A]',
  },
  danger: {
    icon: XCircle,
    bg: 'bg-[#DC2626]/10',
    border: 'border-l-[#DC2626]',
    iconColor: 'text-[#DC2626]',
    titleColor: 'text-[#FECACA]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#0284C7]/10',
    border: 'border-l-[#0284C7]',
    iconColor: 'text-[#0284C7]',
    titleColor: 'text-[#BAE6FD]',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-[#16A34A]/10',
    border: 'border-l-[#16A34A]',
    iconColor: 'text-[#16A34A]',
    titleColor: 'text-[#BBF7D0]',
  }
};

export default function AlertCard({ type = 'info', title, message }) {
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border-l-4 border border-slate-700/50 ${config.bg} ${config.border} flex items-start space-x-3`}>
      <Icon className={`h-5 w-5 mt-0.5 ${config.iconColor} flex-shrink-0`} />
      <div>
        <h4 className={`text-sm font-medium ${config.titleColor} mb-1`}>{title}</h4>
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}
