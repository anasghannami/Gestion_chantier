import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 dark:bg-[#D97706]/10',
    border: 'border-l-amber-500 dark:border-l-[#D97706]',
    iconColor: 'text-amber-600 dark:text-[#D97706]',
    titleColor: 'text-amber-900 dark:text-[#FDE68A]',
  },
  danger: {
    icon: XCircle,
    bg: 'bg-red-500/10 dark:bg-[#DC2626]/10',
    border: 'border-l-red-600 dark:border-l-[#DC2626]',
    iconColor: 'text-red-600 dark:text-[#DC2626]',
    titleColor: 'text-red-900 dark:text-[#FECACA]',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-500/10 dark:bg-[#0284C7]/10',
    border: 'border-l-sky-600 dark:border-l-[#0284C7]',
    iconColor: 'text-sky-600 dark:text-[#0284C7]',
    titleColor: 'text-sky-900 dark:text-[#BAE6FD]',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/10 dark:bg-[#16A34A]/10',
    border: 'border-l-emerald-600 dark:border-l-[#16A34A]',
    iconColor: 'text-emerald-600 dark:text-[#16A34A]',
    titleColor: 'text-emerald-900 dark:text-[#BBF7D0]',
  }
};

export default function AlertCard({ type = 'info', title, message }) {
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border-l-4 border border-slate-300/80 dark:border-slate-700/50 ${config.bg} ${config.border} flex items-start space-x-3 transition-colors duration-200`}>
      <Icon className={`h-5 w-5 mt-0.5 ${config.iconColor} flex-shrink-0`} />
      <div>
        <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>{title}</h4>
        <p className="text-sm text-slate-700 dark:text-slate-300 font-normal">{message}</p>
      </div>
    </div>
  );
}
