'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePet } from '@/contexts/PetContext';
import { Tabs, Button, Modal, Input, EmptyState } from '@/components/ui';
import { AIResultCard } from '@/components/health/AIResultCard';
import { HealthRecordList } from '@/components/health/HealthRecordList';
import { Loader2, Heart, Edit3, Plus, Stethoscope, AlertTriangle } from 'lucide-react';
import type { AITriageResult } from '@/lib/ai-provider';

interface HealthProfile {
  id: number;
  petId: number;
  weight?: number | null;
  isNeutered?: boolean | null;
  vaccineRecords: string;
  dewormRecords: string;
  allergies?: string | null;
  medicalHistory?: string | null;
  currentMeds?: string | null;
  lastVetVisit?: string | null;
  lastVetReason?: string | null;
  nextReminder?: string | null;
}

interface HealthRecord {
  id: number;
  type: string;
  recordDate: string;
  description?: string | null;
  images?: string;
  createdAt: string;
}

const DURATION_OPTIONS = [
  { value: '<1天', label: '小于 1 天' },
  { value: '1-3天', label: '1-3 天' },
  { value: '4-7天', label: '4-7 天' },
  { value: '1-2周', label: '1-2 周' },
  { value: '>2周', label: '超过 2 周' },
];

const APPETITE_OPTIONS = [
  { value: '正常', label: '正常' },
  { value: '减退', label: '减退' },
  { value: '废绝', label: '废绝' },
];

const DRINKING_OPTIONS = [
  { value: '正常', label: '正常' },
  { value: '增多', label: '增多' },
  { value: '减少', label: '减少' },
];

const ENERGY_OPTIONS = [
  { value: '正常', label: '正常' },
  { value: '嗜睡', label: '嗜睡' },
  { value: '焦躁', label: '焦躁' },
];

const RECORD_TYPE_OPTIONS = [
  { value: 'VACCINE', label: '疫苗接种' },
  { value: 'DEWORM', label: '驱虫' },
  { value: 'CHECKUP', label: '体检' },
  { value: 'SURGERY', label: '手术' },
  { value: 'MEDICATION', label: '用药' },
  { value: 'OTHER', label: '其他' },
];

export default function HealthPage() {
  const { pets, currentPet, switchPet } = usePet();
  const [activeTab, setActiveTab] = useState('record');

  // Profile state
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Records state
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [addRecordForm, setAddRecordForm] = useState({ type: 'OTHER', recordDate: '', description: '' });
  const [addingRecord, setAddingRecord] = useState(false);

  // AI triage state
  const [triageSubmitting, setTriageSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<AITriageResult | null>(null);
  const [triageForm, setTriageForm] = useState({
    petId: currentPet?.id?.toString() || '',
    symptoms: '',
    duration: '<1天',
    appetite: '正常',
    drinking: '正常',
    energy: '正常',
    bowelMovement: '',
    isVomiting: false,
    hasInjury: false,
    images: [] as File[],
  });

  // Sync petId when currentPet changes
  useEffect(() => {
    if (currentPet) {
      setTriageForm((prev) => ({ ...prev, petId: currentPet.id.toString() }));
    }
  }, [currentPet]);

  // Load profile
  const loadProfile = useCallback(async () => {
    if (!currentPet) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/health/profile?petId=${currentPet.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch {
      // ignore
    } finally {
      setProfileLoading(false);
    }
  }, [currentPet]);

  // Load records
  const loadRecords = useCallback(async () => {
    if (!currentPet) return;
    setRecordsLoading(true);
    try {
      const res = await fetch(`/api/health/records?petId=${currentPet.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
      }
    } catch {
      // ignore
    } finally {
      setRecordsLoading(false);
    }
  }, [currentPet]);

  useEffect(() => {
    loadProfile();
    loadRecords();
  }, [loadProfile, loadRecords]);

  // Open edit profile modal
  const openEditModal = () => {
    if (!profile) return;
    setEditForm({
      weight: profile.weight?.toString() || '',
      isNeutered: profile.isNeutered === true ? 'true' : profile.isNeutered === false ? 'false' : '',
      allergies: profile.allergies || '',
      medicalHistory: profile.medicalHistory || '',
      currentMeds: profile.currentMeds || '',
      lastVetVisit: profile.lastVetVisit ? profile.lastVetVisit.slice(0, 10) : '',
      lastVetReason: profile.lastVetReason || '',
      nextReminder: profile.nextReminder ? profile.nextReminder.slice(0, 10) : '',
    });
    setEditModalOpen(true);
  };

  const saveProfile = async () => {
    if (!currentPet) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/health/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: currentPet.id,
          weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
          isNeutered: editForm.isNeutered === 'true' ? true : editForm.isNeutered === 'false' ? false : undefined,
          allergies: editForm.allergies || undefined,
          medicalHistory: editForm.medicalHistory || undefined,
          currentMeds: editForm.currentMeds || undefined,
          lastVetVisit: editForm.lastVetVisit || undefined,
          lastVetReason: editForm.lastVetReason || undefined,
          nextReminder: editForm.nextReminder || undefined,
        }),
      });
      if (res.ok) {
        setEditModalOpen(false);
        loadProfile();
      }
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const addRecord = async () => {
    if (!currentPet) return;
    if (!addRecordForm.recordDate) return;
    setAddingRecord(true);
    try {
      const res = await fetch('/api/health/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: currentPet.id,
          type: addRecordForm.type,
          recordDate: addRecordForm.recordDate,
          description: addRecordForm.description || undefined,
        }),
      });
      if (res.ok) {
        setAddRecordModalOpen(false);
        setAddRecordForm({ type: 'OTHER', recordDate: '', description: '' });
        loadRecords();
      }
    } catch {
      // ignore
    } finally {
      setAddingRecord(false);
    }
  };

  const submitTriage = async () => {
    if (!triageForm.petId || !triageForm.symptoms) return;
    setTriageSubmitting(true);
    setTriageResult(null);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      if (triageForm.images.length > 0) {
        for (const file of triageForm.images) {
          const fd = new FormData();
          fd.append('file', file);
          const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
          if (upRes.ok) {
            const upData = await upRes.json();
            imageUrls.push(upData.url);
          }
        }
      }

      const res = await fetch('/api/health/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: Number(triageForm.petId),
          symptoms: triageForm.symptoms,
          duration: triageForm.duration,
          appetite: triageForm.appetite,
          drinking: triageForm.drinking,
          energy: triageForm.energy,
          bowelMovement: triageForm.bowelMovement || undefined,
          isVomiting: triageForm.isVomiting,
          hasInjury: triageForm.hasInjury,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTriageResult(data.result);
      }
    } catch {
      // ignore
    } finally {
      setTriageSubmitting(false);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '未记录';
    return d.slice(0, 10);
  };

  const tryParseVaccineRecords = (raw: string) => {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr.join('、');
      return '未记录';
    } catch {
      return raw || '未记录';
    }
  };

  if (!currentPet) {
    return (
      <div className="max-w-mobile mx-auto px-4 pt-20">
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="请先在「我的」页面选择当前宠物"
          description="选择一个宠物后即可查看健康档案与AI分诊"
        />
      </div>
    );
  }

  return (
    <div className="max-w-mobile mx-auto px-4 pb-24">
      <h1 className="text-lg font-bold text-ink mb-4 pt-4">健康管理</h1>

      {/* Pet selector for multiple pets */}
      {pets.length > 1 && (
        <div className="mb-4">
          <select
            className="w-full px-4 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
              focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
            value={currentPet.id}
            onChange={(e) => switchPet(Number(e.target.value))}
          >
            {pets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <Tabs
        tabs={[
          { key: 'record', label: '健康档案' },
          { key: 'ai', label: 'AI 健康助手' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {/* ========== Tab 1: 健康档案 ========== */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            {/* Profile card */}
            {profileLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              </div>
            ) : profile ? (
              <div className="bg-surface-white rounded-[12px] p-4 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-ink">健康档案</h3>
                  <Button variant="outline" size="sm" onClick={openEditModal}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    编辑档案
                  </Button>
                </div>

                {/* Section: 基本信息 */}
                <SectionGroup title="基本信息" last={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <ProfileField label="体重" value={profile.weight ? `${profile.weight} kg` : '未记录'} />
                    <ProfileField label="绝育" value={profile.isNeutered === true ? '已绝育' : profile.isNeutered === false ? '未绝育' : '未记录'} />
                  </div>
                </SectionGroup>

                {/* Section: 免疫与驱虫 */}
                <SectionGroup title="免疫与驱虫" last={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <ProfileField label="疫苗接种" value={tryParseVaccineRecords(profile.vaccineRecords)} />
                    <ProfileField label="驱虫记录" value={tryParseVaccineRecords(profile.dewormRecords)} />
                  </div>
                </SectionGroup>

                {/* Section: 病史与用药 */}
                <SectionGroup title="病史与用药" last={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <ProfileField label="过敏史" value={profile.allergies || '未记录'} />
                    <ProfileField label="既往病史" value={profile.medicalHistory || '未记录'} />
                    <ProfileField label="当前用药" value={profile.currentMeds || '未记录'} />
                  </div>
                </SectionGroup>

                {/* Section: 就医记录 */}
                <SectionGroup title="就医记录" last={true}>
                  <div className="grid grid-cols-2 gap-3">
                    <ProfileField label="上次就诊" value={formatDate(profile.lastVetVisit)} />
                    <ProfileField label="就诊原因" value={profile.lastVetReason || '未记录'} />
                    <ProfileField label="下次提醒" value={formatDate(profile.nextReminder)} />
                  </div>
                </SectionGroup>
              </div>
            ) : (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              </div>
            )}

            {/* Records section header */}
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-ink">健康记录</h3>
              <Button variant="outline" size="sm" onClick={() => setAddRecordModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加记录
              </Button>
            </div>

            {/* Records list */}
            {recordsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              </div>
            ) : (
              <HealthRecordList records={records} />
            )}
          </div>
        )}

        {/* ========== Tab 2: AI 健康助手 ========== */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Warning banner */}
            <div className="bg-warning-50 border border-warning-500/20 rounded-[10px] p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-[1px]" />
              <p className="text-[12px] text-ink-muted leading-relaxed">
                AI 结果仅供初步分诊参考，不能替代执业兽医诊断。如宠物出现紧急症状，请立即前往宠物医院就诊。
              </p>
            </div>

            {/* Triage form */}
            <div className="bg-surface-white rounded-[12px] border border-border p-4 shadow-card">
              <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-coral-500" />
                分诊表
              </h3>

              <div className="space-y-4">
                {/* a. 就诊宠物 */}
                <div>
                  <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                    就诊宠物 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                      focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
                    value={triageForm.petId}
                    onChange={(e) => setTriageForm({ ...triageForm, petId: e.target.value })}
                  >
                    {!triageForm.petId && <option value="">请选择宠物</option>}
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* b. 症状描述 */}
                <div>
                  <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                    症状描述 <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                      placeholder:text-ink-faded/60 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400
                      min-h-[100px] resize-none transition"
                    placeholder="请详细描述宠物的症状，例如：猫咪从昨天开始呕吐、不吃东西、精神萎靡..."
                    value={triageForm.symptoms}
                    onChange={(e) => setTriageForm({ ...triageForm, symptoms: e.target.value })}
                  />
                </div>

                {/* c/d. Duration / Appetite / Drinking / Energy grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                      持续时间 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                        focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
                      value={triageForm.duration}
                      onChange={(e) => setTriageForm({ ...triageForm, duration: e.target.value })}
                    >
                      {DURATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                      食欲状况 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                        focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
                      value={triageForm.appetite}
                      onChange={(e) => setTriageForm({ ...triageForm, appetite: e.target.value })}
                    >
                      {APPETITE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                      饮水状况 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                        focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
                      value={triageForm.drinking}
                      onChange={(e) => setTriageForm({ ...triageForm, drinking: e.target.value })}
                    >
                      {DRINKING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                      精神状态 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
                        focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
                      value={triageForm.energy}
                      onChange={(e) => setTriageForm({ ...triageForm, energy: e.target.value })}
                    >
                      {ENERGY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* e. 排便 */}
                <Input
                  label="排便/排尿（选填）"
                  placeholder="例如：正常 / 稀便 / 便秘"
                  value={triageForm.bowelMovement}
                  onChange={(e) => setTriageForm({ ...triageForm, bowelMovement: e.target.value })}
                />

                {/* f. Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-coral-500 focus:ring-coral-500/20"
                      checked={triageForm.isVomiting}
                      onChange={(e) => setTriageForm({ ...triageForm, isVomiting: e.target.checked })}
                    />
                    <span className="text-[14px] text-ink-muted">有呕吐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-coral-500 focus:ring-coral-500/20"
                      checked={triageForm.hasInjury}
                      onChange={(e) => setTriageForm({ ...triageForm, hasInjury: e.target.checked })}
                    />
                    <span className="text-[14px] text-ink-muted">有外伤</span>
                  </label>
                </div>

                {/* g. 相关图片 */}
                <div>
                  <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
                    相关图片（选填，最多 3 张）
                  </label>
                  {triageForm.images.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {triageForm.images.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-surface-alt">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`上传图片 ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const newFiles = triageForm.images.filter((_, j) => j !== i);
                              setTriageForm({ ...triageForm, images: newFiles });
                            }}
                            className="absolute top-0 right-0 w-5 h-5 bg-danger-500 text-white text-[11px] rounded-bl-[6px] flex items-center justify-center
                              hover:bg-danger-600 transition-colors"
                            aria-label={`删除第 ${i + 1} 张图片`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {triageForm.images.length < 3 && (
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-[8px]
                      text-[14px] text-ink-faded cursor-pointer hover:border-coral-400 hover:text-coral-500 transition">
                      <Plus className="w-4 h-4" aria-label="添加" />
                      选择图片
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTriageForm({
                              ...triageForm,
                              images: [...triageForm.images, file],
                            });
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* h. Submit */}
                <Button
                  className="w-full"
                  size="lg"
                  loading={triageSubmitting}
                  disabled={!triageForm.petId || !triageForm.symptoms.trim()}
                  onClick={submitTriage}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  {triageSubmitting ? 'AI 正在分析...' : '开始 AI 健康咨询'}
                </Button>
              </div>
            </div>

            {/* Result display */}
            {triageResult && <AIResultCard result={triageResult} />}
          </div>
        )}
      </div>

      {/* ========== Edit Profile Modal ========== */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="编辑健康档案">
        <div className="space-y-4">
          <Input label="体重 (kg)" type="number" step="0.1" value={editForm.weight || ''}
            onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} />
          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">是否绝育</label>
            <select className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
              focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
              value={editForm.isNeutered || ''}
              onChange={(e) => setEditForm({ ...editForm, isNeutered: e.target.value })}>
              <option value="">未选择</option>
              <option value="true">已绝育</option>
              <option value="false">未绝育</option>
            </select>
          </div>
          <Input label="过敏史" value={editForm.allergies || ''}
            onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })} />
          <Input label="既往病史" value={editForm.medicalHistory || ''}
            onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })} />
          <Input label="当前用药" value={editForm.currentMeds || ''}
            onChange={(e) => setEditForm({ ...editForm, currentMeds: e.target.value })} />
          <Input label="上次就诊日期" type="date" value={editForm.lastVetVisit || ''}
            onChange={(e) => setEditForm({ ...editForm, lastVetVisit: e.target.value })} />
          <Input label="就诊原因" value={editForm.lastVetReason || ''}
            onChange={(e) => setEditForm({ ...editForm, lastVetReason: e.target.value })} />
          <Input label="下次提醒日期" type="date" value={editForm.nextReminder || ''}
            onChange={(e) => setEditForm({ ...editForm, nextReminder: e.target.value })} />
          <Button className="w-full" loading={savingProfile} onClick={saveProfile}>保存</Button>
        </div>
      </Modal>

      {/* ========== Add Record Modal ========== */}
      <Modal open={addRecordModalOpen} onClose={() => setAddRecordModalOpen(false)} title="添加健康记录">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">记录类型</label>
            <select className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
              focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400 transition"
              value={addRecordForm.type}
              onChange={(e) => setAddRecordForm({ ...addRecordForm, type: e.target.value })}>
              {RECORD_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Input label="日期" type="date" value={addRecordForm.recordDate}
            onChange={(e) => setAddRecordForm({ ...addRecordForm, recordDate: e.target.value })} />
          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">描述</label>
            <textarea className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-[8px] bg-surface-white text-ink
              placeholder:text-ink-faded/60 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-400
              min-h-[80px] resize-none transition"
              placeholder="记录详情..."
              value={addRecordForm.description}
              onChange={(e) => setAddRecordForm({ ...addRecordForm, description: e.target.value })} />
          </div>
          <Button className="w-full" loading={addingRecord} disabled={!addRecordForm.recordDate} onClick={addRecord}>添加</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ---- Internal helpers ---- */

function SectionGroup({ title, children, last }: { title: string; children: React.ReactNode; last: boolean }) {
  return (
    <div className={last ? '' : 'pb-3 mb-3 border-b border-border-light'}>
      <h4 className="text-[12px] font-medium text-ink-faded mb-2">{title}</h4>
      {children}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  const isEmpty = value === '未记录' || value === '无' || !value;
  return (
    <div>
      <p className="text-[12px] text-ink-faded">{label}</p>
      <p className={`text-[14px] truncate ${isEmpty ? 'text-ink-faded italic' : 'text-ink'}`}>
        {isEmpty ? '未设置' : value}
      </p>
    </div>
  );
}
