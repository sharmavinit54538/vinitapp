import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Download, IdCard, Upload } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import {
  downloadAndShareSlip,
  pickKycDocument,
  triggerHaptic,
} from '@/services/nativeModules';

export default function EmployeePayrollDocsScreen() {
  const { session } = useAuth();
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchEmployeeDashboard
  );
  const [banner, setBanner] = useState<string | null>(null);

  const handleDownloadPayslip = async (monthLabel: string, netPayInr: number) => {
    await triggerHaptic('medium');
    const filename = `OFC360_Payslip_${monthLabel.replace(/\s+/g, '_')}.txt`;
    const content = `OFC360 ENTERPRISE PAYSLIP\nEmployee: ${session?.user.fullName || 'Rohan Kulkarni'}\nPeriod: ${monthLabel}\nNet Credited: INR ${netPayInr.toLocaleString('en-IN')}\nStatus: Credited`;
    await downloadAndShareSlip({ filename, content });
    await triggerHaptic('success');
    setBanner(`Saved & opened share sheet for ${filename}`);
  };

  const handleUploadKyc = async () => {
    await triggerHaptic('light');
    const picked = await pickKycDocument();
    if (picked.canceled || !picked.name || !data) return;
    await triggerHaptic('success');
    setData({
      ...data,
      kycDocuments: [
        {
          id: `DOC-${Date.now()}`,
          name: picked.name,
          category: 'Education',
          status: 'Uploaded',
          fileUri: picked.uri,
          updatedAt: 'Just now',
        },
        ...data.kycDocuments,
      ],
    });
    setBanner(`Uploaded KYC document: ${picked.name}`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="PAYROLL & DOCS" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {banner ? (
          <View className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <Text className="text-xs font-bold text-emerald-800">{banner}</Text>
          </View>
        ) : null}

        {data ? (
          <>
            <View className="rounded-3xl bg-slate-900 p-5 gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <IdCard size={18} color="#818CF8" />
                  <Text className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    OFC360 Digital ID Card
                  </Text>
                </View>
                <StatusPill label={data.digitalIdCard.employeeCode} tone="indigo" />
              </View>
              <Text className="text-xl font-extrabold text-white">
                {session?.user.fullName || 'Rohan Kulkarni'}
              </Text>
              <Text className="text-xs text-slate-300">
                {session?.user.designation || 'Senior Product Engineer'} ·{' '}
                {session?.user.department || 'Engineering'}
              </Text>
              <View className="flex-row justify-between pt-3 border-t border-slate-800">
                <Text className="text-[11px] text-slate-400">
                  Blood: {data.digitalIdCard.bloodGroup}
                </Text>
                <Text className="text-[11px] text-slate-400">
                  Valid Thru: {data.digitalIdCard.validThru}
                </Text>
              </View>
            </View>

            <NativeCard>
              <SectionHeader title="Monthly Payslips" />
              <View className="gap-3">
                {data.payslips.map((slip) => (
                  <View
                    key={slip.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900">{slip.monthLabel}</Text>
                      <Text className="text-xs text-slate-600 mt-0.5">
                        Net ₹{slip.netPayInr.toLocaleString('en-IN')} · Gross ₹
                        {slip.grossPayInr.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <PrimaryButton
                      title="Download"
                      icon={<Download size={14} color="#FFFFFF" />}
                      onPress={() => void handleDownloadPayslip(slip.monthLabel, slip.netPayInr)}
                    />
                  </View>
                ))}
              </View>
            </NativeCard>

            <NativeCard>
              <SectionHeader title="KYC & HR Document Vault" />
              <View className="mb-3">
                <PrimaryButton
                  title="Upload KYC via Document Picker"
                  tone="slate"
                  icon={<Upload size={15} color="#FFFFFF" />}
                  onPress={() => void handleUploadKyc()}
                />
              </View>
              {data.kycDocuments.map((doc, idx) => (
                <View
                  key={doc.id}
                  className={`py-2.5 flex-row items-center justify-between ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <Text className="text-[11px] text-slate-500">
                      {doc.category} · {doc.updatedAt}
                    </Text>
                  </View>
                  <StatusPill
                    label={doc.status}
                    tone={doc.status === 'Verified' ? 'emerald' : 'indigo'}
                  />
                </View>
              ))}
            </NativeCard>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
