import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { ArrowRight, X } from 'lucide-react-native';
import { AppText } from './AppText';
import { GlassButton } from './GlassButton';
import { theme } from '../theme/theme';

interface AiAssistantBannerProps {
  onAskAI: () => void;
  onDismiss?: () => void;
}

export const AiAssistantBanner: React.FC<AiAssistantBannerProps> = ({
  onAskAI,
  onDismiss,
}) => {
  return (
    <View style={styles.cardContainer}>
      {onDismiss && (
        <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} hitSlop={12}>
          <X size={16} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      )}

      <View style={styles.contentRow}>
        <View style={styles.robotAvatarContainer}>
          <Image
            source={require('../../assets/images/ai_robot_mascot.png')}
            style={styles.robotMascotImg}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="h3" weight="bold" style={styles.titleText}>
            AI Health Assistant
          </AppText>
          <AppText variant="caption" style={styles.descText}>
            Ask questions about your animals' health, feeding, or preventive care.
          </AppText>

          <GlassButton
            title="Ask AI"
            onPress={onAskAI}
            variant="primary"
            size="sm"
            icon={<ArrowRight size={14} color="#FFFFFF" />}
            style={styles.askBtn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F0FDF4', // Light mint soft fill
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: theme.spacing.md,
    position: 'relative',
    ...theme.shadows.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  robotMascotImg: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: theme.colors.neutral[900],
    fontSize: 15,
    marginBottom: 2,
  },
  descText: {
    color: theme.colors.neutral[600],
    fontSize: 11,
    marginBottom: theme.spacing.sm,
  },
  askBtn: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
  },
});
