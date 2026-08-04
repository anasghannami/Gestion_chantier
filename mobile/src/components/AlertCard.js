import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight, Building2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export function AlertCard({ alert, onMarkRead, onDelete, onPressDetail }) {
  const { themeColors, isDarkMode } = useTheme();

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITIQUE':
        return {
          badgeBg: '#EF444420',
          badgeText: '#EF4444',
          borderColor: '#EF4444',
          Icon: AlertCircle,
        };
      case 'ALERTE':
        return {
          badgeBg: '#F59E0B20',
          badgeText: '#F59E0B',
          borderColor: '#F59E0B',
          Icon: AlertTriangle,
        };
      default:
        return {
          badgeBg: '#0284C720',
          badgeText: '#0284C7',
          borderColor: '#0284C7',
          Icon: Info,
        };
    }
  };

  const priorityInfo = getPriorityStyle(alert.priority);
  const IconComp = priorityInfo.Icon;

  const handleRead = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onMarkRead?.(alert.id);
  };

  const handlePressCard = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
    onPressDetail?.(alert);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePressCard}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: alert.isRead ? themeColors.border : priorityInfo.borderColor,
          borderLeftWidth: alert.isRead ? 1 : 4,
          opacity: alert.isRead ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconComp size={18} color={priorityInfo.badgeText} style={styles.icon} />
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
            {alert.title}
          </Text>
        </View>

        {/* Priority Badge */}
        <View style={[styles.badge, { backgroundColor: priorityInfo.badgeBg }]}>
          <Text style={[styles.badgeText, { color: priorityInfo.badgeText }]}>
            {alert.priority}
          </Text>
        </View>
      </View>

      <Text style={[styles.message, { color: themeColors.subtext }]} numberOfLines={3}>
        {alert.message}
      </Text>

      {alert.chantierNom && (
        <View style={styles.chantierRow}>
          <Building2 size={13} color={themeColors.subtext} />
          <Text style={[styles.chantierText, { color: themeColors.subtext }]}>
            {alert.chantierNom}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.date, { color: themeColors.subtext }]}>
          {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        <View style={styles.actions}>
          {!alert.isRead && (
            <TouchableOpacity onPress={handleRead} style={styles.actionBtn}>
              <CheckCircle2 size={15} color="#16A34A" />
              <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>Lu</Text>
            </TouchableOpacity>
          )}

          <ChevronRight size={16} color={themeColors.subtext} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  chantierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  chantierText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  date: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
