import React, { useState } from 'react';
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
  BadgeCheck,
  CheckCircle2,
  Download,
  FileText,
  IdCard,
  QrCode,
  Receipt,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  EmployeeHrLetter,
  EmployeeKycDocument,
  type EmployeePayrollDocsTab as EmployeePayrollDocsSubTab,
  EmployeePayslip,
  EmployeePortalState,
  computePayslipTotals,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

interface EmployeePayrollDocsTabProps {
  state: EmployeePortalState;
  activeSubTab: EmployeePayrollDocsSubTab;
  isDark: boolean;
  onSelectSubTab: (sub: EmployeePayrollDocsSubTab) => void;
  onAcknowledgeLetter: (letterId: string) => void;
  onUploadKycDoc: (payload: {
    docType: EmployeeKycDocument['docType'];
    documentNumberMasked: string;
    fileName: string;
  }) => void;
  onSuccessToast: (msg: string) => void;
}

export function EmployeePayrollDocsTab({
  state,
  activeSubTab,
  isDark,
  onSelectSubTab,
  onAcknowledgeLetter,
  onUploadKycDoc,
  onSuccessToast,
}: EmployeePayrollDocsTabProps) {
  const palette = getPalette(isDark);
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslip | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<EmployeeHrLetter | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycDocType, setKycDocType] =
    useState<EmployeeKycDocument['docType']>('Education Certificate');
  const [kycNumber, setKycNumber] = useState('');
  const [kycFileName, setKycFileName] = useState('');
  const [kycError, setKycError] = useState<string | null>(null);

  const latestPayslip = state.payslips[0];
  const latestTotals = latestPayslip ? computePayslipTotals(latestPayslip) : null;

  const handleDownloadPayslip = (slip: EmployeePayslip) => {
    const totals = computePayslipTotals(slip);
    const lines = [
      `OFC360 EMPLOYEE PAYSLIP - ${slip.monthLabel}`,
      `Employee: ${state.profile.fullName} (${state.profile.employeeId})`,
      `Department: ${state.profile.department} | Designation: ${state.profile.designation}`,
      `Pay Period: ${slip.payPeriod} | Pay Date: ${slip.payDate}`,
      `--------------------------------------------------`,
      `EARNINGS:`,
      ...slip.earnings.map((e) => `  ${e.label}: INR ${e.amount.toLocaleString('en-IN')}`),
      `  Reimbursements: INR ${slip.reimbursements.toLocaleString('en-IN')}`,
      `DEDUCTIONS:`,
      ...slip.deductions.map((d) => `  ${d.label}: INR ${d.amount.toLocaleString('en-IN')}`),
      `--------------------------------------------------`,
      `Gross Earnings: INR ${totals.grossEarnings.toLocaleString('en-IN')}`,
      `Total Deductions: INR ${totals.totalDeductions.toLocaleString('en-IN')}`,
      `Net Salary Credited (${slip.bankAccountMasked}): INR ${totals.netPay.toLocaleString('en-IN')}`,
    ].join('\n');

    if (typeof document !== 'undefined') {
      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `OFC360_Payslip_${slip.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    onSuccessToast(`Payslip for ${slip.monthLabel} downloaded`);
  };

  const handleKycSubmit = () => {
    if (kycNumber.trim().length < 4) {
      setKycError('Enter document reference or masked ID number.');
      return;
    }
    if (kycFileName.trim().length < 3) {
      setKycError('Select or enter a document file name.');
      return;
    }
    onUploadKycDoc({
      docType: kycDocType,
      documentNumberMasked: kycNumber.trim(),
      fileName: kycFileName.trim(),
    });
    setKycNumber('');
    setKycFileName('');
    setKycError(null);
    setIsKycModalOpen(false);
  };

  return (
    <View style={empSharedStyles.stack}>
      {/* Sub-Navigation Segmented Bar */}
      <View
        style={[
          styles.segmentBar,
          { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
        ]}
      >
        {(
          [
            { id: 'payslips', label: 'Payslips & Tax', Icon: Receipt },
            { id: 'id_letters', label: 'ID & Letters', Icon: IdCard },
            { id: 'kyc_vault', label: 'KYC Vault', Icon: ShieldCheck },
          ] as const
        ).map((item) => {
          const active = activeSubTab === item.id;
          const TabIcon = item.Icon;
          return (
            <Pressable
              key={item.id}
              accessibilityLabel={item.label}
              onPress={() => onSelectSubTab(item.id)}
              style={[
                styles.segmentBtn,
                active
                  ? {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                      borderWidth: 1,
                    }
                  : null,
              ]}
            >
              <TabIcon
                size={14}
                color={active ? palette.primary : palette.textMuted}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? palette.primary : palette.textMuted },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 1. PAYSLIPS & TAX SUB-TAB */}
      {activeSubTab === 'payslips' && latestPayslip && latestTotals ? (
        <View style={empSharedStyles.stack}>
          {/* CTC & Monthly Take-Home Summary */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <View>
                <Text style={[styles.eyebrow, { color: palette.emerald }]}>
                  Latest Compensation · {latestPayslip.monthLabel}
                </Text>
                <Text style={[styles.netSalaryBig, { color: palette.textPrimary }]}>
                  ₹{latestTotals.netPay.toLocaleString('en-IN')}
                </Text>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  Annual CTC ₹{(latestPayslip.ctcAnnual / 100000).toFixed(2)} LPA ·{' '}
                  {latestPayslip.taxRegime}
                </Text>
              </View>
              <View style={[empSharedStyles.statusBadge, { backgroundColor: palette.emeraldBg }]}>
                <Text style={[empSharedStyles.statusBadgeText, { color: palette.emerald }]}>
                  {latestPayslip.paymentStatus}
                </Text>
              </View>
            </View>

            <View style={styles.splitRow}>
              <View style={[styles.splitBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  Gross + Reimb.
                </Text>
                <Text style={[styles.splitNum, { color: palette.emerald }]}>
                  ₹{(latestTotals.grossEarnings + latestPayslip.reimbursements).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={[styles.splitBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  Total Deductions
                </Text>
                <Text style={[styles.splitNum, { color: palette.rose }]}>
                  ₹{latestTotals.totalDeductions.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Monthly Payslips List */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
              Monthly Payslips ({state.payslips.length})
            </Text>
            {state.payslips.map((slip, idx) => {
              const totals = computePayslipTotals(slip);
              return (
                <View
                  key={slip.id}
                  style={[
                    empSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {slip.monthLabel}
                      </Text>
                      <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                        Net ₹{totals.netPay.toLocaleString('en-IN')} · Paid {slip.payDate}
                      </Text>
                    </View>
                    <View style={styles.actionPair}>
                      <Pressable
                        accessibilityLabel={`View Breakdown ${slip.monthLabel}`}
                        onPress={() => setSelectedPayslip(slip)}
                        style={[
                          empSharedStyles.filterChip,
                          { backgroundColor: palette.primaryLight, borderColor: palette.primary },
                        ]}
                      >
                        <Text style={[empSharedStyles.filterChipText, { color: palette.primary }]}>
                          Details
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Download Payslip ${slip.monthLabel}`}
                        onPress={() => handleDownloadPayslip(slip)}
                        style={[
                          empSharedStyles.filterChip,
                          { backgroundColor: palette.inputBg, borderColor: palette.border },
                        ]}
                      >
                        <Download size={14} color={palette.textPrimary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Tax Provision & Reimbursements Summary */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
              Tax Provision &amp; Reimbursements
            </Text>
            <View style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                Active Tax Regime
              </Text>
              <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {latestPayslip.taxRegime} (FY 2026–27)
              </Text>
            </View>
            <View style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                YTD TDS Deducted
              </Text>
              <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.textPrimary }]}>
                ₹{(latestPayslip.tdsDeducted * 7).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                Form 16 / Provision Slip
              </Text>
              <Pressable
                onPress={() => onSuccessToast('FY 2026–27 Tax Provision Slip downloaded')}
              >
                <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
                  Download Slip
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {/* 2. DIGITAL ID CARD & HR LETTERS SUB-TAB */}
      {activeSubTab === 'id_letters' ? (
        <View style={empSharedStyles.stack}>
          {/* Digital Employee ID Card */}
          <View
            style={[
              styles.idCard,
              { backgroundColor: palette.secondaryCta, borderColor: palette.border },
            ]}
          >
            <View style={styles.idCardHeader}>
              <Text style={styles.idBrand}>OFC360 · DIGITAL ID</Text>
              <View style={[empSharedStyles.statusBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                <Text style={[empSharedStyles.statusBadgeText, { color: '#34D399' }]}>
                  ACTIVE STAFF
                </Text>
              </View>
            </View>

            <View style={styles.idCardBody}>
              <View style={[styles.idAvatar, { backgroundColor: palette.primary }]}>
                <Text style={styles.idAvatarText}>{state.profile.avatarInitials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.idName}>{state.profile.fullName}</Text>
                <Text style={styles.idRole}>{state.profile.designation}</Text>
                <Text style={styles.idMeta}>
                  {state.profile.department} · {state.profile.location}
                </Text>
              </View>
              <View style={styles.qrBox}>
                <QrCode size={42} color="#0F172A" />
              </View>
            </View>

            <View style={styles.idCardFooter}>
              <View>
                <Text style={styles.idFooterLabel}>EMPLOYEE CODE</Text>
                <Text style={styles.idFooterVal}>{state.profile.employeeId}</Text>
              </View>
              <View>
                <Text style={styles.idFooterLabel}>BLOOD GROUP</Text>
                <Text style={styles.idFooterVal}>{state.profile.bloodGroup}</Text>
              </View>
              <View>
                <Text style={styles.idFooterLabel}>EMERGENCY</Text>
                <Text style={styles.idFooterVal}>{state.profile.emergencyContactPhone}</Text>
              </View>
            </View>
          </View>

          {/* HR Letters & Policies */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
              HR Letters &amp; Company Policies ({state.hrLetters.length})
            </Text>
            {state.hrLetters.map((ltr, idx) => (
              <View
                key={ltr.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {ltr.title}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {ltr.category} · Issued {ltr.issuedDate} · {ltr.referenceCode}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Open ${ltr.title}`}
                    onPress={() => setSelectedLetter(ltr)}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        backgroundColor: ltr.acknowledged
                          ? palette.inputBg
                          : palette.amberBg,
                        borderColor: ltr.acknowledged ? palette.border : palette.amber,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        {
                          color: ltr.acknowledged ? palette.primary : palette.amber,
                        },
                      ]}
                    >
                      {ltr.requiresAcknowledgment && !ltr.acknowledged ? 'Sign Policy' : 'View'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 3. PERSONAL KYC VAULT SUB-TAB */}
      {activeSubTab === 'kyc_vault' ? (
        <View style={empSharedStyles.stack}>
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <View>
                <Text style={[styles.eyebrow, { color: palette.primary }]}>
                  Encrypted Identity Storage
                </Text>
                <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                  Personal KYC Vault ({state.kycDocuments.length})
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Upload KYC Document"
                onPress={() => {
                  setKycError(null);
                  setIsKycModalOpen(true);
                }}
                style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
              >
                <Upload size={15} color="#FFFFFF" />
                <Text style={empSharedStyles.primaryBtnText}>Upload</Text>
              </Pressable>
            </View>

            {state.kycDocuments.map((doc, idx) => {
              const tone = getStatusTone(doc.status, palette);
              return (
                <View
                  key={doc.id}
                  style={[
                    empSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {doc.docType}
                      </Text>
                      <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                        {doc.documentNumberMasked} · {doc.fileName}
                      </Text>
                      {doc.reviewerNote ? (
                        <Text style={[empSharedStyles.metaText, { color: tone.text, marginTop: 3 }]}>
                          {doc.reviewerNote}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                        {doc.status}
                      </Text>
                    </View>
                  </View>
                  {doc.status === 'Rejected' ? (
                    <Pressable
                      onPress={() => {
                        setKycDocType(doc.docType);
                        setKycNumber(doc.documentNumberMasked);
                        setKycError(null);
                        setIsKycModalOpen(true);
                      }}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
                        Re-upload Clear Scan →
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Payslip Detail Breakdown Modal */}
      <Modal
        visible={Boolean(selectedPayslip)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPayslip(null)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            {selectedPayslip ? (
              <>
                <View style={empSharedStyles.modalHeaderRow}>
                  <View>
                    <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                      {selectedPayslip.monthLabel} Payslip
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {selectedPayslip.payPeriod} · {selectedPayslip.bankAccountMasked}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedPayslip(null)}>
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[empSharedStyles.fieldLabel, { color: palette.emerald }]}>
                    EARNINGS
                  </Text>
                  {selectedPayslip.earnings.map((e) => (
                    <View key={e.label} style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
                      <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                        {e.label}
                      </Text>
                      <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.textPrimary }]}>
                        ₹{e.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                  {selectedPayslip.reimbursements > 0 ? (
                    <View style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
                      <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                        Approved Reimbursements
                      </Text>
                      <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.emerald }]}>
                        +₹{selectedPayslip.reimbursements.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={[empSharedStyles.fieldLabel, { color: palette.rose, marginTop: 14 }]}>
                    DEDUCTIONS
                  </Text>
                  {selectedPayslip.deductions.map((d) => (
                    <View key={d.label} style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
                      <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                        {d.label}
                      </Text>
                      <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.rose }]}>
                        -₹{d.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}

                  <View style={[styles.netTotalBanner, { backgroundColor: palette.primaryLight }]}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.primary }]}>
                      Net Salary Credited
                    </Text>
                    <Text style={[styles.netTotalNum, { color: palette.primary }]}>
                      ₹{computePayslipTotals(selectedPayslip).netPay.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDownloadPayslip(selectedPayslip)}
                    style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 14 }]}
                  >
                    <Download size={16} color="#FFFFFF" />
                    <Text style={empSharedStyles.primaryBtnText}>Download Payslip Copy</Text>
                  </Pressable>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Letter & Policy Acknowledgment Modal */}
      <Modal
        visible={Boolean(selectedLetter)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLetter(null)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            {selectedLetter ? (
              <>
                <View style={empSharedStyles.modalHeaderRow}>
                  <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary, flex: 1 }]}>
                    {selectedLetter.title}
                  </Text>
                  <Pressable onPress={() => setSelectedLetter(null)}>
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                  Ref: {selectedLetter.referenceCode} · Issued {selectedLetter.issuedDate}
                </Text>
                <Text style={[styles.letterSummary, { color: palette.textSecondary }]}>
                  {selectedLetter.summary}
                </Text>

                {selectedLetter.acknowledged ? (
                  <View style={[styles.ackBox, { backgroundColor: palette.emeraldBg }]}>
                    <CheckCircle2 size={18} color={palette.emerald} />
                    <Text style={[empSharedStyles.subTitle, { color: palette.emerald }]}>
                      Acknowledged on {selectedLetter.acknowledgedAt || 'Verified'}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityLabel="Acknowledge and Sign Policy"
                    onPress={() => {
                      onAcknowledgeLetter(selectedLetter.id);
                      setSelectedLetter(null);
                    }}
                    style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 16 }]}
                  >
                    <BadgeCheck size={17} color="#FFFFFF" />
                    <Text style={empSharedStyles.primaryBtnText}>
                      Acknowledge &amp; Sign Policy
                    </Text>
                  </Pressable>
                )}
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* KYC Upload Modal */}
      <Modal
        visible={isKycModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsKycModalOpen(false)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={empSharedStyles.modalHeaderRow}>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Upload / Update KYC Document
              </Text>
              <Pressable onPress={() => setIsKycModalOpen(false)}>
                <X size={20} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {kycError ? (
                <View
                  style={[
                    empSharedStyles.errorBanner,
                    { backgroundColor: palette.roseBg, borderColor: palette.rose },
                  ]}
                >
                  <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                    {kycError}
                  </Text>
                </View>
              ) : null}

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                Document Type
              </Text>
              <View style={empSharedStyles.chipRow}>
                {(
                  ['Aadhaar Card', 'PAN Card', 'Passport', 'Education Certificate'] as const
                ).map((dt) => {
                  const active = kycDocType === dt;
                  return (
                    <Pressable
                      key={dt}
                      onPress={() => setKycDocType(dt)}
                      style={[
                        empSharedStyles.filterChip,
                        {
                          backgroundColor: active ? palette.primaryLight : palette.inputBg,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          empSharedStyles.filterChipText,
                          { color: active ? palette.primary : palette.textSecondary },
                        ]}
                      >
                        {dt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Document Reference / Number
              </Text>
              <TextInput
                accessibilityLabel="KYC Document Number"
                value={kycNumber}
                onChangeText={setKycNumber}
                placeholder="e.g. B.Tech CSE · Univ Roll 19CS084"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Document File Name
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  accessibilityLabel="KYC File Name"
                  value={kycFileName}
                  onChangeText={setKycFileName}
                  placeholder="verified_scan_2026.pdf"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    empSharedStyles.input,
                    {
                      flex: 1,
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
                <Pressable
                  onPress={() => setKycFileName(`${kycDocType.toLowerCase().replace(/\s+/g, '_')}_clear.pdf`)}
                  style={[
                    empSharedStyles.secondaryBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <FileText size={15} color={palette.primary} />
                  <Text style={[empSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                    Pick
                  </Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                <Pressable
                  onPress={() => setIsKycModalOpen(false)}
                  style={[
                    empSharedStyles.secondaryBtn,
                    { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[empSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Submit KYC Document"
                  onPress={handleKycSubmit}
                  style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
                >
                  <Text style={empSharedStyles.primaryBtnText}>Submit for Verification</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  segmentText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  netSalaryBig: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  splitBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  splitNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 16,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  idCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idBrand: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 1,
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  idAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idAvatarText: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idName: {
    fontFamily: FONT_SANS,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  idRole: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    color: '#A5B4FC',
    marginTop: 1,
  },
  idMeta: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 12,
  },
  idFooterLabel: {
    fontFamily: FONT_SANS,
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  idFooterVal: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  netTotalBanner: {
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netTotalNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
  letterSummary: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  ackBox: {
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
