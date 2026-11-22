import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Printer,
  QrCode,
  ScanFace,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Ofc360Role } from '@/lib/auth-schemas';
import { LeaveBalanceItem } from '@/lib/employee-portal-logic';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ItAdminProfileData,
  ItAssetCategory,
  ItAssetCondition,
  ItAssetItem,
  ItHelpdeskTicket,
  ItSelfServiceState,
  ItTicketPriority,
  ItUserAccount,
  buildDeterministicQrMatrix,
  validateAssetPayload,
  validateNewUserProvisioning,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

/* ============================================================================
 * 1. ADD / EDIT ASSET MODAL
 * ========================================================================== */
interface AddEditAssetModalProps {
  visible: boolean;
  editingAsset: ItAssetItem | null;
  isDark: boolean;
  onClose: () => void;
  onSaveAsset: (payload: {
    id?: string;
    assetTag: string;
    category: ItAssetCategory;
    brandModel: string;
    serialNumber: string;
    purchaseDate: string;
    warrantyExpiry: string;
    condition: ItAssetCondition;
    location: string;
  }) => void;
}

const ASSET_CATEGORIES: ItAssetCategory[] = [
  'Laptop',
  'Monitor',
  'Smartphone',
  'Access Card',
  'Biometric Terminal',
  'Software License',
];

const ASSET_CONDITIONS: ItAssetCondition[] = ['Mint', 'Good', 'Fair', 'Faulty'];

export function AddEditAssetModal(props: AddEditAssetModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <AddEditAssetModalContent
          key={props.editingAsset?.id || 'new-asset'}
          {...props}
        />
      ) : null}
    </Modal>
  );
}

function AddEditAssetModalContent({
  editingAsset,
  isDark,
  onClose,
  onSaveAsset,
}: AddEditAssetModalProps) {
  const palette = getPalette(isDark);
  const [assetTag, setAssetTag] = useState(editingAsset?.assetTag || '');
  const [category, setCategory] = useState<ItAssetCategory>(
    editingAsset?.category || 'Laptop'
  );
  const [brandModel, setBrandModel] = useState(editingAsset?.brandModel || '');
  const [serialNumber, setSerialNumber] = useState(
    editingAsset?.serialNumber || ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    editingAsset?.purchaseDate || '2026-11-10'
  );
  const [warrantyExpiry, setWarrantyExpiry] = useState(
    editingAsset?.warrantyExpiry || '2029-11-09'
  );
  const [condition, setCondition] = useState<ItAssetCondition>(
    editingAsset?.condition || 'Mint'
  );
  const [location, setLocation] = useState(
    editingAsset?.location || 'HQ IT Cage · Shelf A2'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    const check = validateAssetPayload({
      assetTag,
      brandModel,
      serialNumber,
      purchaseDate,
      warrantyExpiry,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please fill in all required asset fields.');
      return;
    }
    onSaveAsset({
      id: editingAsset?.id,
      assetTag: assetTag.trim().toUpperCase(),
      category,
      brandModel: brandModel.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      purchaseDate: purchaseDate.trim(),
      warrantyExpiry: warrantyExpiry.trim(),
      condition,
      location: location.trim() || 'HQ IT Cage',
    });
    onClose();
  };

  return (
    <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              {editingAsset ? `Edit ${editingAsset.assetTag}` : 'Register IT Asset'}
            </Text>
            <Pressable accessibilityLabel="Close Asset Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  itSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Asset Tag
            </Text>
            <TextInput
              accessibilityLabel="Asset Tag Input"
              value={assetTag}
              onChangeText={(t) => {
                setAssetTag(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. OFC-MBP-0990"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                itSharedStyles.monoText,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Category
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
              {ASSET_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    accessibilityLabel={`Select Asset Category ${cat}`}
                    onPress={() => setCategory(cat)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Brand &amp; Model
            </Text>
            <TextInput
              accessibilityLabel="Asset Brand Model Input"
              value={brandModel}
              onChangeText={(t) => {
                setBrandModel(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. Apple MacBook Pro 14 M3"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Serial Number / License Key
            </Text>
            <TextInput
              accessibilityLabel="Asset Serial Number Input"
              value={serialNumber}
              onChangeText={(t) => {
                setSerialNumber(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. C02YM990MD6R"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                itSharedStyles.monoText,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Purchase Date
                </Text>
                <TextInput
                  accessibilityLabel="Asset Purchase Date Input"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    itSharedStyles.input,
                    itSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Warranty Expiry
                </Text>
                <TextInput
                  accessibilityLabel="Asset Warranty Expiry Input"
                  value={warrantyExpiry}
                  onChangeText={setWarrantyExpiry}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    itSharedStyles.input,
                    itSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            <Text
              style={[
                itSharedStyles.fieldLabel,
                { color: palette.textSecondary, marginTop: 10 },
              ]}
            >
              Condition
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
              {ASSET_CONDITIONS.map((cond) => {
                const active = condition === cond;
                return (
                  <Pressable
                    key={cond}
                    onPress={() => setCondition(cond)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flex: 1,
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {cond}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Storage / Deployment Location
            </Text>
            <TextInput
              accessibilityLabel="Asset Location Input"
              value={location}
              onChangeText={setLocation}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Pressable
              accessibilityLabel="Save IT Asset Button"
              onPress={handleSubmit}
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>
                {editingAsset ? 'Save Asset Changes' : 'Register Asset'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
  );
}

/* ============================================================================
 * 2. ASSIGN ASSET TO EMPLOYEE MODAL
 * ========================================================================== */
interface AssignAssetModalProps {
  visible: boolean;
  assets: ItAssetItem[];
  targetAsset: ItAssetItem | null;
  users: ItUserAccount[];
  isDark: boolean;
  onClose: () => void;
  onConfirmAssign: (
    assetId: string,
    employee: { employeeId: string; fullName: string; department: string }
  ) => { valid: boolean; error?: string };
}

export function AssignAssetModal(props: AssignAssetModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <AssignAssetModalContent
          key={props.targetAsset?.id || 'assign-asset'}
          {...props}
        />
      ) : null}
    </Modal>
  );
}

function AssignAssetModalContent({
  assets,
  targetAsset,
  users,
  isDark,
  onClose,
  onConfirmAssign,
}: AssignAssetModalProps) {
  const palette = getPalette(isDark);
  const availableAssets = useMemo(
    () => assets.filter((a) => a.status === 'Available'),
    [assets]
  );
  const [selectedAssetId, setSelectedAssetId] = useState(
    targetAsset?.id || availableAssets[0]?.id || ''
  );
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAssign = () => {
    const emp = users.find((u) => u.id === selectedUserId);
    if (!selectedAssetId) {
      setErrorMsg('Select an available asset to assign.');
      return;
    }
    if (!emp) {
      setErrorMsg('Select an employee recipient.');
      return;
    }
    const res = onConfirmAssign(selectedAssetId, {
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      department: emp.department,
    });
    if (!res.valid) {
      setErrorMsg(res.error || 'Unable to assign asset.');
      return;
    }
    onClose();
  };

  return (
    <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Assign Hardware / License
            </Text>
            <Pressable accessibilityLabel="Close Assign Asset Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  itSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Select Available Asset
            </Text>
            <View style={[styles.selectStack, { marginBottom: 12 }]}>
              {(targetAsset ? [targetAsset] : availableAssets).map((a) => {
                const active = selectedAssetId === a.id;
                return (
                  <Pressable
                    key={a.id}
                    accessibilityLabel={`Choose Asset ${a.assetTag}`}
                    onPress={() => setSelectedAssetId(a.id)}
                    style={[
                      styles.selectRow,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {a.assetTag} · {a.brandModel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Assign to Employee
            </Text>
            <View style={styles.selectStack}>
              {users.map((u) => {
                const active = selectedUserId === u.id;
                return (
                  <Pressable
                    key={u.id}
                    accessibilityLabel={`Assign Recipient ${u.employeeId}`}
                    onPress={() => setSelectedUserId(u.id)}
                    style={[
                      styles.selectRow,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {u.fullName} ({u.employeeId}) · {u.department}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityLabel="Confirm Asset Assignment"
              onPress={handleAssign}
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>Confirm Assignment</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
  );
}

/* ============================================================================
 * 3. QR CODE GENERATOR & MOBILE SCANNER MODAL
 * ========================================================================== */
interface QrGeneratorScannerModalProps {
  visible: boolean;
  initialMode: 'sticker' | 'scan';
  initialAsset: ItAssetItem | null;
  assets: ItAssetItem[];
  isDark: boolean;
  onClose: () => void;
  onQuickStatusToggle: (assetId: string) => void;
  onPrintConfirmed: (assetTag: string) => void;
}

export function QrGeneratorScannerModal(props: QrGeneratorScannerModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <QrGeneratorScannerModalContent
          key={`${props.initialMode}-${props.initialAsset?.id || 'default'}`}
          {...props}
        />
      ) : null}
    </Modal>
  );
}

function QrGeneratorScannerModalContent({
  initialMode,
  initialAsset,
  assets,
  isDark,
  onClose,
  onQuickStatusToggle,
  onPrintConfirmed,
}: QrGeneratorScannerModalProps) {
  const palette = getPalette(isDark);
  const [mode, setMode] = useState<'sticker' | 'scan'>(initialMode);
  const [scanTagInput, setScanTagInput] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(
    initialAsset?.id || assets[0]?.id || ''
  );

  const activeAsset = useMemo(() => {
    if (mode === 'scan' && scanTagInput.trim()) {
      const q = scanTagInput.trim().toLowerCase();
      return (
        assets.find(
          (a) =>
            a.assetTag.toLowerCase() === q ||
            a.qrPayload.toLowerCase() === q ||
            a.assetTag.toLowerCase().includes(q)
        ) || null
      );
    }
    return assets.find((a) => a.id === selectedAssetId) || assets[0] || null;
  }, [mode, scanTagInput, selectedAssetId, assets]);

  const qrMatrix = useMemo(
    () => buildDeterministicQrMatrix(activeAsset?.qrPayload || 'OFC360:ASSET'),
    [activeAsset?.qrPayload]
  );

  return (
    <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Asset QR Sticker &amp; Scanner
            </Text>
            <Pressable accessibilityLabel="Close QR Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.modeToggleRow, { marginBottom: 14 }]}>
            <Pressable
              accessibilityLabel="QR Sticker Mode"
              onPress={() => setMode('sticker')}
              style={[
                itSharedStyles.filterChip,
                {
                  flex: 1,
                  backgroundColor: mode === 'sticker' ? palette.primaryLight : palette.inputBg,
                  borderColor: mode === 'sticker' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  itSharedStyles.filterChipText,
                  { color: mode === 'sticker' ? palette.primary : palette.textSecondary },
                ]}
              >
                QR Sticker Generator
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="QR Scanner Mode"
              onPress={() => setMode('scan')}
              style={[
                itSharedStyles.filterChip,
                {
                  flex: 1,
                  backgroundColor: mode === 'scan' ? palette.primaryLight : palette.inputBg,
                  borderColor: mode === 'scan' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  itSharedStyles.filterChipText,
                  { color: mode === 'scan' ? palette.primary : palette.textSecondary },
                ]}
              >
                Mobile QR Scanner
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {mode === 'scan' ? (
              <View style={{ marginBottom: 12 }}>
                <View
                  style={[
                    styles.scannerFrame,
                    { backgroundColor: palette.inputBg, borderColor: palette.primary },
                  ]}
                >
                  <QrCode size={40} color={palette.primary} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary, marginTop: 8 }]}>
                    Camera QR Target Ready
                  </Text>
                  <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                    Enter or tap a tag below to simulate optical QR lookup
                  </Text>
                </View>
                <TextInput
                  accessibilityLabel="Scan QR Asset Tag Input"
                  value={scanTagInput}
                  onChangeText={setScanTagInput}
                  placeholder="Scan or type tag e.g. OFC-MBP-0842"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    itSharedStyles.input,
                    itSharedStyles.monoText,
                    {
                      marginTop: 10,
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
                <View style={[itSharedStyles.chipRow, { marginTop: 8 }]}>
                  {assets.slice(0, 3).map((sample) => (
                    <Pressable
                      key={sample.id}
                      accessibilityLabel={`Simulate Scan ${sample.assetTag}`}
                      onPress={() => setScanTagInput(sample.assetTag)}
                      style={[
                        itSharedStyles.filterChip,
                        { backgroundColor: palette.primaryLight, borderColor: palette.primary },
                      ]}
                    >
                      <Text
                        style={[
                          itSharedStyles.filterChipText,
                          itSharedStyles.monoText,
                          { color: palette.primary },
                        ]}
                      >
                        {sample.assetTag}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {activeAsset ? (
              <View
                style={[
                  styles.stickerCard,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <View style={styles.qrMatrixBox}>
                  {qrMatrix.map((row, rIdx) => (
                    <View key={rIdx} style={styles.qrRow}>
                      {row.map((cell, cIdx) => (
                        <View
                          key={cIdx}
                          style={[
                            styles.qrCell,
                            { backgroundColor: cell ? '#0F172A' : '#FFFFFF' },
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                <Text
                  style={[
                    itSharedStyles.subTitle,
                    itSharedStyles.monoText,
                    { color: palette.textPrimary, marginTop: 10 },
                  ]}
                >
                  {activeAsset.assetTag}
                </Text>
                <Text style={[itSharedStyles.metaText, { color: palette.textSecondary }]}>
                  {activeAsset.brandModel}
                </Text>
                <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                  Status: {activeAsset.status} · {activeAsset.assignedToName || activeAsset.location}
                </Text>

                <View style={styles.stickerActions}>
                  <Pressable
                    accessibilityLabel="Print QR Sticker"
                    onPress={() => onPrintConfirmed(activeAsset.assetTag)}
                    style={[
                      itSharedStyles.primaryBtn,
                      { flex: 1, backgroundColor: palette.primary },
                    ]}
                  >
                    <Printer size={14} color="#FFFFFF" />
                    <Text style={itSharedStyles.primaryBtnText}>Print Label</Text>
                  </Pressable>
                  {activeAsset.status === 'Assigned' || activeAsset.status === 'Available' ? (
                    <Pressable
                      accessibilityLabel="Toggle Scanned Asset Status"
                      onPress={() => onQuickStatusToggle(activeAsset.id)}
                      style={[
                        itSharedStyles.secondaryBtn,
                        {
                          flex: 1,
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text style={[itSharedStyles.secondaryBtnText, { color: palette.textPrimary }]}>
                        {activeAsset.status === 'Assigned' ? 'Check In Return' : 'Mark Repair'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text style={[itSharedStyles.metaText, { color: palette.rose }]}>
                No asset matched that QR code.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
  );
}

/* ============================================================================
 * 4. LOG / UPDATE ASSET REPAIR MODAL
 * ========================================================================== */
interface LogRepairModalProps {
  visible: boolean;
  asset: ItAssetItem | null;
  isDark: boolean;
  onClose: () => void;
  onSubmitRepair: (
    assetId: string,
    payload: {
      vendor: string;
      issueSummary: string;
      costInr: number;
      markCompleted?: boolean;
    }
  ) => { valid: boolean; error?: string };
}

export function LogRepairModal(props: LogRepairModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <LogRepairModalContent
          key={props.asset?.id || 'log-repair'}
          {...props}
        />
      ) : null}
    </Modal>
  );
}

function LogRepairModalContent({
  asset,
  isDark,
  onClose,
  onSubmitRepair,
}: LogRepairModalProps) {
  const palette = getPalette(isDark);
  const [vendor, setVendor] = useState(
    asset?.repairLogs[0]?.vendor || 'iCare Enterprise Bengaluru'
  );
  const [issueSummary, setIssueSummary] = useState(
    asset?.repairLogs[0]?.issueSummary || ''
  );
  const [costText, setCostText] = useState(
    String(asset?.repairLogs[0]?.costInr ?? 0)
  );
  const [markCompleted, setMarkCompleted] = useState(
    asset?.status === 'In Repair'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = () => {
    if (!asset) return;
    const res = onSubmitRepair(asset.id, {
      vendor,
      issueSummary,
      costInr: Number(costText) || 0,
      markCompleted,
    });
    if (!res.valid) {
      setErrorMsg(res.error || 'Enter repair details.');
      return;
    }
    onClose();
  };

  return (
    <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Repair &amp; Maintenance Log
            </Text>
            <Pressable accessibilityLabel="Close Repair Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                itSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Authorized Vendor / Service Center
          </Text>
          <TextInput
            accessibilityLabel="Repair Vendor Input"
            value={vendor}
            onChangeText={setVendor}
            style={[
              itSharedStyles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 10,
              },
            ]}
          />

          <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Fault / Maintenance Summary
          </Text>
          <TextInput
            accessibilityLabel="Repair Issue Input"
            value={issueSummary}
            onChangeText={setIssueSummary}
            placeholder="Describe battery, display, or board issue..."
            placeholderTextColor={palette.textMuted}
            multiline
            style={[
              itSharedStyles.textArea,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 10,
              },
            ]}
          />

          <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Estimated / Final Repair Cost (INR)
          </Text>
          <TextInput
            accessibilityLabel="Repair Cost Input"
            value={costText}
            onChangeText={setCostText}
            keyboardType="numeric"
            style={[
              itSharedStyles.input,
              itSharedStyles.monoText,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 12,
              },
            ]}
          />

          <View style={styles.modeToggleRow}>
            <Pressable
              onPress={() => setMarkCompleted(false)}
              style={[
                itSharedStyles.filterChip,
                {
                  flex: 1,
                  backgroundColor: !markCompleted ? palette.amberBg : palette.inputBg,
                  borderColor: !markCompleted ? palette.amber : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  itSharedStyles.filterChipText,
                  { color: !markCompleted ? palette.amber : palette.textSecondary },
                ]}
              >
                Send to Repair
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMarkCompleted(true)}
              style={[
                itSharedStyles.filterChip,
                {
                  flex: 1,
                  backgroundColor: markCompleted ? palette.emeraldBg : palette.inputBg,
                  borderColor: markCompleted ? palette.emerald : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  itSharedStyles.filterChipText,
                  { color: markCompleted ? palette.emerald : palette.textSecondary },
                ]}
              >
                Mark Repaired
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Save Repair Log Button"
            onPress={handleSave}
            style={[
              itSharedStyles.primaryBtn,
              { backgroundColor: palette.primary, marginTop: 14 },
            ]}
          >
            <Text style={itSharedStyles.primaryBtnText}>Save Repair Status</Text>
          </Pressable>
        </View>
      </View>
  );
}

/* ============================================================================
 * 5. CREATE IT TICKET MODAL
 * ========================================================================== */
interface CreateItTicketModalProps {
  visible: boolean;
  users: ItUserAccount[];
  isDark: boolean;
  onClose: () => void;
  onCreateTicket: (payload: {
    subject: string;
    description: string;
    category: ItHelpdeskTicket['category'];
    priority: ItTicketPriority;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    department: string;
  }) => void;
}

export function CreateItTicketModal({
  visible,
  users,
  isDark,
  onClose,
  onCreateTicket,
}: CreateItTicketModalProps) {
  const palette = getPalette(isDark);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItHelpdeskTicket['category']>('Hardware');
  const [priority, setPriority] = useState<ItTicketPriority>('High');
  const [requesterId, setRequesterId] = useState(users[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = () => {
    if (subject.trim().length < 4) {
      setErrorMsg('Enter a clear ticket subject (min 4 characters).');
      return;
    }
    if (description.trim().length < 6) {
      setErrorMsg('Describe the IT issue (min 6 characters).');
      return;
    }
    const req = users.find((u) => u.id === requesterId) || users[0];
    onCreateTicket({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      employeeId: req?.employeeId || 'EMP-2048',
      employeeName: req?.fullName || 'Rohan Kulkarni',
      employeeEmail: req?.email || 'rohan.kulkarni@ofc360.com',
      department: req?.department || 'Core Engineering',
    });
    setSubject('');
    setDescription('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Create IT Support Ticket
            </Text>
            <Pressable accessibilityLabel="Close Create Ticket Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  itSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Affected Employee
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.hChipScroll, { marginBottom: 10 }]}
            >
              {users.map((u) => {
                const active = requesterId === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setRequesterId(u.id)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {u.fullName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Category
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
              {(
                ['Hardware', 'VPN & Network', 'Email & SSO', 'Biometric Sync', 'Software Access'] as const
              ).map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Priority
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
              {(['Critical', 'High', 'Medium', 'Low'] as const).map((pr) => {
                const active = priority === pr;
                return (
                  <Pressable
                    key={pr}
                    onPress={() => setPriority(pr)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flex: 1,
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {pr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Subject
            </Text>
            <TextInput
              accessibilityLabel="IT Ticket Subject Input"
              value={subject}
              onChangeText={(t) => {
                setSubject(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. Configure Okta MFA on replacement phone"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Description
            </Text>
            <TextInput
              accessibilityLabel="IT Ticket Description Input"
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setErrorMsg(null);
              }}
              multiline
              placeholder="Detailed steps, device asset tag, or error details..."
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Pressable
              accessibilityLabel="Submit Create IT Ticket"
              onPress={handleCreate}
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>Create Ticket</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 6. PROVISION USER & RBAC MODAL
 * ========================================================================== */
interface ProvisionUserModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onProvisionUser: (payload: {
    fullName: string;
    email: string;
    employeeId: string;
    department: string;
    role: Ofc360Role;
    enrollBiometrics: boolean;
  }) => void;
}

export function ProvisionUserModal({
  visible,
  isDark,
  onClose,
  onProvisionUser,
}: ProvisionUserModalProps) {
  const palette = getPalette(isDark);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [role, setRole] = useState<Ofc360Role>('employee');
  const [enrollBiometrics, setEnrollBiometrics] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProvision = () => {
    const check = validateNewUserProvisioning({
      fullName,
      email,
      employeeId,
      department,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Complete all user provisioning fields.');
      return;
    }
    onProvisionUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      employeeId: employeeId.trim().toUpperCase(),
      department: department.trim(),
      role,
      enrollBiometrics,
    });
    setFullName('');
    setEmail('');
    setEmployeeId('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Provision User &amp; Access
            </Text>
            <Pressable accessibilityLabel="Close Provision User Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  itSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Full Name
            </Text>
            <TextInput
              accessibilityLabel="Provision Full Name Input"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. Kiran Patel"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Official Email
            </Text>
            <TextInput
              accessibilityLabel="Provision Email Input"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. kiran.patel@ofc360.com"
              placeholderTextColor={palette.textMuted}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  marginBottom: 10,
                },
              ]}
            />

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Employee ID
                </Text>
                <TextInput
                  accessibilityLabel="Provision Employee ID Input"
                  value={employeeId}
                  onChangeText={(t) => {
                    setEmployeeId(t);
                    setErrorMsg(null);
                  }}
                  placeholder="EMP-2105"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    itSharedStyles.input,
                    itSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Department
                </Text>
                <TextInput
                  accessibilityLabel="Provision Department Input"
                  value={department}
                  onChangeText={setDepartment}
                  style={[
                    itSharedStyles.input,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            <Text
              style={[
                itSharedStyles.fieldLabel,
                { color: palette.textSecondary, marginTop: 10 },
              ]}
            >
              RBAC Role Assignment
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
              {(
                [
                  { id: 'employee', label: 'Employee' },
                  { id: 'manager', label: 'Manager' },
                  { id: 'hr_admin', label: 'HR Admin' },
                  { id: 'it_admin', label: 'IT Admin' },
                  { id: 'executive', label: 'Executive' },
                ] as const
              ).map((r) => {
                const active = role === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setEnrollBiometrics((v) => !v)}
              style={[
                styles.selectRow,
                {
                  backgroundColor: enrollBiometrics ? palette.emeraldBg : palette.inputBg,
                  borderColor: enrollBiometrics ? palette.emerald : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  itSharedStyles.subTitle,
                  { color: enrollBiometrics ? palette.emerald : palette.textSecondary },
                ]}
              >
                {enrollBiometrics
                  ? '✓ Push Biometric / Face Check-In Enrollment'
                  : 'Push Biometric / Face Check-In Enrollment'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Confirm Provision User"
              onPress={handleProvision}
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>Activate &amp; Provision Account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 7. IT ADMIN PERSONAL SELF-SERVICE MODALS (FACE CHECK-IN & LEAVE)
 * ========================================================================== */
export function ItSelfCheckInModal({
  visible,
  isDark,
  profile,
  selfService,
  onClose,
  onSubmitPunch,
}: {
  visible: boolean;
  isDark: boolean;
  profile: ItAdminProfileData;
  selfService: ItSelfServiceState;
  onClose: () => void;
  onSubmitPunch: (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH';
  }) => void;
}) {
  const palette = getPalette(isDark);
  const actionLabel: 'Check-In' | 'Check-Out' =
    selfService.todayStatus === 'Checked In' ? 'Check-Out' : 'Check-In';
  const [workMode, setWorkMode] = useState<'Office' | 'WFH'>(selfService.workMode);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Self {actionLabel}
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                {profile.fullName} · {profile.itAdminId}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                itSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View style={[itSharedStyles.chipRow, { marginBottom: 12 }]}>
            {(['Office', 'WFH'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setWorkMode(m)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    flex: 1,
                    backgroundColor: workMode === m ? palette.primaryLight : palette.inputBg,
                    borderColor: workMode === m ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    itSharedStyles.filterChipText,
                    { color: workMode === m ? palette.primary : palette.textSecondary },
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.scannerFrame,
              {
                backgroundColor: palette.inputBg,
                borderColor: selfieCaptured ? palette.emerald : palette.border,
              },
            ]}
          >
            <ScanFace
              size={36}
              color={selfieCaptured ? palette.emerald : palette.primary}
            />
            <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary, marginTop: 8 }]}>
              {selfieCaptured ? 'Biometric Liveness Verified' : 'Capture Face Verification'}
            </Text>
            <View style={styles.geoRow}>
              <MapPin size={13} color={palette.emerald} />
              <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                {selfService.locationLabel}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setSelfieCaptured(true);
                setErrorMsg(null);
              }}
              style={[
                itSharedStyles.secondaryBtn,
                {
                  marginTop: 10,
                  backgroundColor: selfieCaptured ? palette.emeraldBg : palette.surface,
                  borderColor: selfieCaptured ? palette.emerald : palette.border,
                },
              ]}
            >
              {selfieCaptured ? (
                <CheckCircle2 size={15} color={palette.emerald} />
              ) : (
                <Camera size={15} color={palette.primary} />
              )}
              <Text
                style={[
                  itSharedStyles.secondaryBtnText,
                  { color: selfieCaptured ? palette.emerald : palette.primary },
                ]}
              >
                {selfieCaptured ? 'Selfie Verified' : 'Capture Face Selfie'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              if (!selfieCaptured) {
                setErrorMsg('Capture biometric face verification first.');
                return;
              }
              onSubmitPunch({ action: actionLabel, workMode });
              setSelfieCaptured(false);
              onClose();
            }}
            style={[
              itSharedStyles.primaryBtn,
              { backgroundColor: palette.primary, marginTop: 14 },
            ]}
          >
            <ShieldCheck size={16} color="#FFFFFF" />
            <Text style={itSharedStyles.primaryBtnText}>Confirm {actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ItSelfApplyLeaveModal({
  visible,
  isDark,
  balances,
  onClose,
  onSubmitLeave,
}: {
  visible: boolean;
  isDark: boolean;
  balances: LeaveBalanceItem[];
  onClose: () => void;
  onSubmitLeave: (payload: {
    leaveKey: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
  }) => void;
}) {
  const palette = getPalette(isDark);
  const [selectedKey, setSelectedKey] = useState(balances[0]?.key || 'earned');
  const [fromDate, setFromDate] = useState('2026-11-28');
  const [toDate, setToDate] = useState('2026-11-28');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedBalance =
    balances.find((b) => b.key === selectedKey) || balances[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            itSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={itSharedStyles.dragHandleWrap}>
            <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={itSharedStyles.modalHeaderRow}>
            <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Apply Personal Leave
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                itSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View style={[itSharedStyles.chipRow, { marginBottom: 10 }]}>
            {balances.map((b) => (
              <Pressable
                key={b.key}
                onPress={() => setSelectedKey(b.key)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    backgroundColor:
                      selectedKey === b.key ? palette.primaryLight : palette.inputBg,
                    borderColor: selectedKey === b.key ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    itSharedStyles.filterChipText,
                    {
                      color:
                        selectedKey === b.key ? palette.primary : palette.textSecondary,
                    },
                  ]}
                >
                  {b.code} ({b.remaining}d)
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                From Date
              </Text>
              <TextInput
                value={fromDate}
                onChangeText={setFromDate}
                style={[
                  itSharedStyles.input,
                  itSharedStyles.monoText,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                To Date
              </Text>
              <TextInput
                value={toDate}
                onChangeText={setToDate}
                style={[
                  itSharedStyles.input,
                  itSharedStyles.monoText,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
            </View>
          </View>

          <TextInput
            value={reason}
            onChangeText={(t) => {
              setReason(t);
              setErrorMsg(null);
            }}
            multiline
            placeholder="Reason for leave..."
            placeholderTextColor={palette.textMuted}
            style={[
              itSharedStyles.textArea,
              {
                marginTop: 10,
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
              },
            ]}
          />

          <Pressable
            onPress={() => {
              if (reason.trim().length < 5) {
                setErrorMsg('Enter a brief leave reason (min 5 characters).');
                return;
              }
              onSubmitLeave({
                leaveKey: selectedKey,
                leaveType: selectedBalance?.label || 'Earned Leave',
                fromDate,
                toDate,
                days: 1,
                reason: reason.trim(),
              });
              setReason('');
              onClose();
            }}
            style={[
              itSharedStyles.primaryBtn,
              { backgroundColor: palette.primary, marginTop: 14 },
            ]}
          >
            <Text style={itSharedStyles.primaryBtnText}>Submit Leave Request</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectStack: {
    gap: 8,
  },
  selectRow: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scannerFrame: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  stickerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  qrMatrixBox: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 12,
    height: 12,
  },
  stickerActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 12,
  },
  hChipScroll: {
    gap: 8,
    paddingRight: 8,
  },
});
