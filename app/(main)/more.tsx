import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Globe,
  Home,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { GlassCard } from '../../src/components/GlassCard';
import { GlassButton } from '../../src/components/GlassButton';
import { Divider } from '../../src/components/Divider';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAppStore } from '../../src/store/useAppStore';
import { formatUserRoleKey } from '../../src/utils/stateSemantics';
import { theme } from '../../src/theme/theme';

export default function MoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { activeFarm, language } = useAppStore();

  const getLanguageName = () => {
    switch (language) {
      case 'hi':
        return 'हिंदी (Hindi)';
      case 'mr':
        return 'मराठी (Marathi)';
      case 'en':
      default:
        return 'English';
    }
  };

  const performLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmMsg = t('more.logoutConfirm');
      if (typeof window !== 'undefined' && window.confirm(confirmMsg)) {
        performLogout();
      }
    } else {
      Alert.alert(
        t('common.logout'),
        t('more.logoutConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.logout'),
            style: 'destructive',
            onPress: performLogout,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const formattedRoleLabel = t(formatUserRoleKey(user?.role));

  return (
    <ScreenContainer scrollable style={styles.container}>
      <AppHeader title={t('more.title')} showBack={false} />

      {/* Profile Glass Card */}
      <GlassCard variant="glass" padding="md" style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <UserIcon size={26} color={theme.colors.primary[800]} />
          </View>
          <View style={styles.profileTextGroup}>
            <AppText variant="h2" weight="bold">
              {user?.name || 'Dairy Farmer'}
            </AppText>
            <View style={styles.roleBadgeRow}>
              <ShieldCheck size={12} color="#059669" />
              <AppText variant="caption" weight="semibold" style={styles.roleBadgeText}>
                {formattedRoleLabel}
              </AppText>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Active Farm Card */}
      <GlassCard variant="tinted" padding="none" style={styles.farmCard}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/(main)/farm-details')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#DCFCE7' }]}>
              <Home size={20} color="#059669" />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="body" weight="bold">
                {t('more.farmDetails')}
              </AppText>
              <AppText variant="caption" style={styles.settingSub}>
                {activeFarm?.name || 'No Farm Selected'} • {activeFarm?.district ? `${activeFarm.district}, ${activeFarm.state}` : 'Location Unspecified'}
              </AppText>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      </GlassCard>

      {/* Settings Options Group */}
      <GlassCard variant="solid" padding="none" style={styles.settingsGroup}>
        {/* Language Choice */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/(auth)/language')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Globe size={20} color={theme.colors.primary[800]} />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="body" weight="medium">
                {t('more.changeLanguage')}
              </AppText>
              <AppText variant="caption" style={styles.settingSub}>
                {getLanguageName()}
              </AppText>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <Divider marginVertical="none" />

        {/* Help & Support */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => Alert.alert('Help & Support', 'Farmer helpline and support center will connect in upcoming releases.')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={theme.colors.primary[800]} />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="body" weight="medium">
                {t('more.helpSupport')}
              </AppText>
              <AppText variant="caption" style={styles.settingSub}>
                {t('more.helpDesc')}
              </AppText>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <Divider marginVertical="none" />

        {/* About App */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => Alert.alert('Smart Livestock Health', 'Commercial startup livestock monitoring platform v1.0.0')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Info size={20} color={theme.colors.primary[800]} />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="body" weight="medium">
                {t('more.about')}
              </AppText>
              <AppText variant="caption" style={styles.settingSub}>
                {t('more.version')}
              </AppText>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      </GlassCard>

      {/* Refined Log Out Button */}
      <View style={styles.logoutWrapper}>
        <GlassButton
          title={t('common.logout')}
          onPress={handleLogout}
          variant="secondary"
          icon={<LogOut size={18} color={theme.colors.status.error} />}
          style={styles.logoutBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  profileCard: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  profileTextGroup: {
    flex: 1,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roleBadgeText: {
    color: '#059669',
    fontSize: 11,
  },
  farmCard: {
    marginBottom: theme.spacing.md,
  },
  settingsGroup: {
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingSub: {
    color: theme.colors.neutral[600],
    marginTop: 2,
    fontSize: 11,
  },
  logoutWrapper: {
    marginBottom: theme.spacing.xl,
  },
  logoutBtn: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
});
