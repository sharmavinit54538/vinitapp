import { StyleSheet } from 'react-native';
import { FONT_MONO, FONT_SANS, NativePalette } from '../../theme/colors';

export function getExecutiveStatusTone(
  status: string,
  palette: NativePalette
): { text: string; bg: string } {
  const s = status.toLowerCase();
  if (
    s === 'approved' ||
    s === 'approved for bank release' ||
    s === 'healthy' ||
    s === 'compliant' ||
    s === 'positive' ||
    s === 'credited' ||
    s === 'checked in'
  ) {
    return { text: palette.emerald, bg: palette.emeraldBg };
  }
  if (
    s === 'critical' ||
    s === 'action needed' ||
    s === 'high' ||
    s === 'over budget'
  ) {
    return { text: palette.rose, bg: palette.roseBg };
  }
  if (
    s === 'watch' ||
    s === 'on hold' ||
    s === 'pending' ||
    s === 'awaiting executive sign-off' ||
    s === 'review due' ||
    s === 'medium' ||
    s === 'important'
  ) {
    return { text: palette.amber, bg: palette.amberBg };
  }
  if (s === 'town hall' || s === 'normal' || s === 'processed') {
    return { text: palette.sky, bg: palette.skyBg };
  }
  return { text: palette.primary, bg: palette.primaryLight };
}

export const execSharedStyles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  cardCompact: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    lineHeight: 17,
  },
  monoText: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  linkText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
  },
  listRow: {
    paddingVertical: 12,
  },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONT_SANS,
    fontSize: 13,
  },
  textArea: {
    minHeight: 82,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONT_SANS,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
});
