'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-border-light px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-ink-muted" aria-label="返回" />
        </button>
        <h1 className="text-lg font-semibold">隐私政策</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 prose prose-sm text-ink leading-relaxed">
        <p className="text-xs text-ink-faded mb-6">最后更新日期：2026年5月1日</p>

        <p className="mb-4">
          PetPal（以下简称"我们"）深知个人信息对您的重要性。我们致力于保护您的隐私和个人信息安全。本隐私政策将详细说明我们如何收集、使用、存储和保护您的信息。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">一、我们收集的信息</h2>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.1 账号信息</h3>
        <p className="mb-3">
          当您注册和使用PetPal时，我们会收集您的手机号码。这是创建账号和身份验证的必要信息。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.2 宠物信息</h3>
        <p className="mb-3">
          当您创建宠物档案时，我们会收集您宠物的姓名、类型、品种、生日、性别、体型、性格标签、简介和头像等信息。这些信息用于在社区中展示宠物身份和进行社交匹配。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.3 健康信息</h3>
        <p className="mb-3">
          当您使用健康管理功能时，我们会收集宠物的体重、绝育状态、疫苗记录、驱虫记录、过敏史、病史、用药记录和就诊记录等健康相关信息。这些信息用于提供个性化的健康管理和AI健康建议。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.4 位置信息</h3>
        <p className="mb-3">
          当您使用位置相关功能（如附近场所、约玩推荐）时，经您授权后我们会收集您选择的位置信息（城市、区域、经纬度）。您可以在设备设置中随时关闭位置权限。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.5 内容信息</h3>
        <p className="mb-3">
          当您发布帖子、评论、私信或其他内容时，我们会收集您发布的内容及相关的元数据（如发布时间）。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.6 设备信息</h3>
        <p className="mb-3">
          为保障服务正常运行和安全防护，我们会收集设备型号、操作系统版本、IP地址和访问日志等技术信息。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">二、信息的使用</h2>
        <p className="mb-3">我们收集的信息将用于以下目的：</p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>创建和管理您的用户账号</li>
          <li>提供宠物档案管理和社区交流功能</li>
          <li>提供宠物健康记录管理和AI健康建议</li>
          <li>根据您的位置信息推荐附近的宠物场所和活动</li>
          <li>优化和改进平台功能与服务体验</li>
          <li>保障平台安全，防范欺诈和恶意行为</li>
          <li>遵守法律法规的要求</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">三、信息的共享</h2>
        <p className="mb-3">
          我们不会将您的个人信息出售给任何第三方。在以下情况下，我们可能会共享您的信息：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>经您明确同意</strong>：在获得您的明确授权后</li>
          <li><strong>法律要求</strong>：根据法律法规、司法程序或政府要求</li>
          <li><strong>服务提供商</strong>：与帮助我们运营平台的服务提供商共享（如云存储服务），这些提供商受合同约束，仅可在提供服务的必要范围内使用信息</li>
          <li><strong>业务转让</strong>：如发生合并、收购或资产出售，您的信息可能作为资产转移</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">四、信息的存储与保护</h2>
        <p className="mb-3">
          您的个人信息存储于中国境内。我们采取合理的技术和管理措施保护您的信息安全，包括但不限于数据加密、访问控制和定期安全审计。
        </p>
        <p className="mb-3">
          尽管我们采取安全措施，但请注意互联网传输不存在绝对安全。我们会尽合理努力保护您的信息，但无法保证绝对的安全性。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">五、信息的保留</h2>
        <p className="mb-3">
          我们仅在为实现本政策所述目的所必需的时间内保留您的个人信息，或按法律法规要求的期限保留。
        </p>
        <p className="mb-3">
          当您注销账号后，我们将对您的个人信息进行脱敏处理或删除，但法律法规另有规定的情况除外。宠物档案将被隐藏，手机号将被脱敏，相关数据无法恢复。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">六、您的权利</h2>
        <p className="mb-3">
          根据相关法律法规，您对您的个人信息享有以下权利：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>查阅权</strong>：您可以随时查看您的个人信息</li>
          <li><strong>更正权</strong>：您可以修改不准确的个人信息</li>
          <li><strong>删除权</strong>：您可以在特定情况下要求删除您的个人信息</li>
          <li><strong>撤回同意</strong>：您可以随时撤回对信息收集的同意，但不影响撤回前已进行的处理</li>
          <li><strong>注销账号</strong>：您可以在"我的"页面申请注销账号</li>
          <li><strong>投诉权</strong>：如您对我们的信息处理有异议，可向监管部门投诉</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">七、Cookie的使用</h2>
        <p className="mb-3">
          我们使用必要的Cookie来维持您的登录状态和会话安全。我们不使用Cookie进行跨站追踪或广告投放。您可以通过浏览器设置管理或禁用Cookie，但这可能影响平台部分功能的正常使用。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">八、未成年人保护</h2>
        <p className="mb-3">
          本平台主要面向年满18周岁的用户。如您未满18周岁，请在监护人陪同下阅读本政策并使用本平台。如我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们将及时删除。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">九、政策的更新</h2>
        <p className="mb-3">
          我们可能会不时更新本隐私政策。更新后的政策将在平台公布，重大变更将通过站内通知或其他适当方式告知。请您定期查看本政策。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">十、联系我们</h2>
        <p className="mb-3">
          如您对本隐私政策有任何疑问、建议或投诉，请通过以下方式联系我们：
        </p>
        <p className="text-teal-600">
          邮箱：privacy@petpal.app
        </p>
      </div>
    </div>
  );
}
