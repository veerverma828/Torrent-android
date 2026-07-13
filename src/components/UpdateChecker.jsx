import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Download, X } from 'lucide-react-native'
import { openInstallPermissionSettings } from '../lib/apkUpdater'
import { useUpdate } from '../context/UpdateContext.jsx'
import { theme } from '../styles/theme.js'

export default function UpdateChecker() {
  const {
    update,
    dismissed,
    phase,
    percent,
    errorMessage,
    startDownload,
    attemptInstall,
    cancelDownload,
    dismiss,
  } = useUpdate()

  if (!update || dismissed) return null

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.card}>
        {phase === 'idle' && (
          <View style={styles.row}>
            <Download size={20} color={theme.colors.accent} />
            <Text style={styles.text}>A new version is available.</Text>
            <TouchableOpacity onPress={startDownload} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismiss} accessibilityLabel="Dismiss">
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {phase === 'downloading' && (
          <View style={{ gap: 8 }}>
            <View style={styles.row}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <Text style={styles.text}>Downloading update… {percent}%</Text>
              <TouchableOpacity onPress={cancelDownload}>
                <Text style={styles.mutedBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        )}

        {phase === 'downloaded' && (
          <View style={styles.row}>
            <Download size={20} color={theme.colors.accent} />
            <Text style={styles.text}>Update downloaded — ready to install.</Text>
            <TouchableOpacity onPress={attemptInstall} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Install</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismiss}>
              <Text style={styles.mutedBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'needs-permission' && (
          <View style={{ gap: 8 }}>
            <Text style={styles.text}>
              Allow Torrent Debrid to install apps, then come back and tap Install again.
            </Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={openInstallPermissionSettings} style={[styles.primaryBtn, { flex: 1 }]}>
                <Text style={styles.primaryBtnText}>Open settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={attemptInstall} style={styles.outlineBtn}>
                <Text style={styles.text}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={dismiss}>
                <Text style={styles.mutedBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.row}>
            <Text style={[styles.text, { color: theme.colors.accent, flex: 1 }]}>{errorMessage}</Text>
            <TouchableOpacity onPress={startDownload} style={styles.outlineBtn}>
              <Text style={styles.text}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismiss}>
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    paddingHorizontal: 16,
    zIndex: 50,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
  },
  mutedBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  primaryBtn: {
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  outlineBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressTrack: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceLight,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
})
