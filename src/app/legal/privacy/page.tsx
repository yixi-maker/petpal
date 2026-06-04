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

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">二、收集的个人信息类型、目的与保存期限</h2>

        <p className="mb-3">下表详细说明我们收集的各类个人信息、收集目的、使用方式及保存期限：</p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-lg">
            <thead className="bg-surface-alt">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-ink-muted border-b border-border">信息类别</th>
                <th className="text-left px-3 py-2 font-medium text-ink-muted border-b border-border">具体内容</th>
                <th className="text-left px-3 py-2 font-medium text-ink-muted border-b border-border">收集目的</th>
                <th className="text-left px-3 py-2 font-medium text-ink-muted border-b border-border">保存期限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              <tr>
                <td className="px-3 py-2 font-medium text-ink">手机号</td>
                <td className="px-3 py-2 text-ink-muted">注册手机号码</td>
                <td className="px-3 py-2 text-ink-muted">账号创建、身份验证、安全登录</td>
                <td className="px-3 py-2 text-ink-muted">账号存续期间；注销后脱敏保留90天</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">昵称</td>
                <td className="px-3 py-2 text-ink-muted">用户设置的显示名称</td>
                <td className="px-3 py-2 text-ink-muted">社区身份展示</td>
                <td className="px-3 py-2 text-ink-muted">账号存续期间；注销后删除</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">宠物档案</td>
                <td className="px-3 py-2 text-ink-muted">宠物姓名、类型、品种、生日、性别、体型、性格标签、简介、头像</td>
                <td className="px-3 py-2 text-ink-muted">社区展示、社交匹配、健康管理基础信息</td>
                <td className="px-3 py-2 text-ink-muted">账号存续期间；注销后隐藏</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">健康记录</td>
                <td className="px-3 py-2 text-ink-muted">体重、绝育状态、疫苗记录、驱虫记录、过敏史、病史、用药记录、就诊记录</td>
                <td className="px-3 py-2 text-ink-muted">提供个性化健康管理和AI健康助手服务</td>
                <td className="px-3 py-2 text-ink-muted">账号存续期间；注销后删除</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">图片</td>
                <td className="px-3 py-2 text-ink-muted">用户上传的宠物头像、帖子图片、健康咨询图片</td>
                <td className="px-3 py-2 text-ink-muted">内容展示、健康分诊参考</td>
                <td className="px-3 py-2 text-ink-muted">内容存续期间；删除内容后30天内从服务器清除</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">模糊位置</td>
                <td className="px-3 py-2 text-ink-muted">城市、区域（经用户授权后获取）</td>
                <td className="px-3 py-2 text-ink-muted">附近场所推荐、地图服务、约玩推荐</td>
                <td className="px-3 py-2 text-ink-muted">用户主动清除位置或注销账号后删除</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">私信</td>
                <td className="px-3 py-2 text-ink-muted">用户间私信内容</td>
                <td className="px-3 py-2 text-ink-muted">提供用户间交流功能</td>
                <td className="px-3 py-2 text-ink-muted">账号存续期间；注销后删除</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-ink">举报记录</td>
                <td className="px-3 py-2 text-ink-muted">举报人、被举报内容、举报原因、处理结果</td>
                <td className="px-3 py-2 text-ink-muted">维护社区安全、处理违规行为</td>
                <td className="px-3 py-2 text-ink-muted">自举报处理完成之日起保存2年</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">三、信息的使用</h2>
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

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">四、敏感个人信息特别说明</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800 font-medium">
            重要提示：您的宠物健康记录（体重、病史、过敏史、用药记录、就诊记录等）属于敏感个人信息。我们仅在获得您的单独同意后收集和使用此类信息，并采取更加严格的保护措施。
          </p>
        </div>

        <p className="mb-3">
          根据《中华人民共和国个人信息保护法》的规定，健康信息属于敏感个人信息。我们在收集和使用您的宠物健康信息时，将：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>在收集前取得您的单独同意</li>
          <li>告知收集该信息的必要性和对您的影响</li>
          <li>仅在提供健康管理功能所必需的范围内使用</li>
          <li>采用加密存储和严格的访问控制措施</li>
          <li>您有权随时撤回同意，撤回后相关功能将无法使用，但不影响撤回前已进行的处理</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">五、位置信息特别说明</h2>
        <p className="mb-3">
          我们收集的位置信息仅用于以下服务，不向任何第三方展示您的精确坐标：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>附近场所推荐</strong>：根据您选择的大致区域推荐附近的宠物友好场所（宠物医院、宠物店、宠物公园等）</li>
          <li><strong>地图服务</strong>：在地图上显示场所分布，方便您查找周边服务</li>
          <li><strong>约玩推荐</strong>：根据区域匹配同城宠物进行社交约玩</li>
        </ul>
        <p className="mb-3">
          您的位置信息以城市和区域为单位进行模糊化处理，我们在任何公开场景（如帖子、评论、宠物档案）中不会展示您的精确经纬度坐标。您可以在设备系统设置中随时关闭位置权限。关闭后，相关的位置服务功能将受到限制，但不影响平台其他功能的正常使用。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">六、信息的共享</h2>
        <p className="mb-3">
          我们不会将您的个人信息出售给任何第三方。在以下情况下，我们可能会共享您的信息：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>经您明确同意</strong>：在获得您的明确授权后</li>
          <li><strong>法律要求</strong>：根据法律法规、司法程序或政府要求</li>
          <li><strong>服务提供商</strong>：与帮助我们运营平台的服务提供商共享（如云存储服务），这些提供商受合同约束，仅可在提供服务的必要范围内使用信息</li>
          <li><strong>业务转让</strong>：如发生合并、收购或资产出售，您的信息可能作为资产转移</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">七、信息的存储与保护</h2>
        <p className="mb-3">
          您的个人信息存储于中国境内。我们采取合理的技术和管理措施保护您的信息安全，包括但不限于数据加密、访问控制和定期安全审计。
        </p>
        <p className="mb-3">
          尽管我们采取安全措施，但请注意互联网传输不存在绝对安全。我们会尽合理努力保护您的信息，但无法保证绝对的安全性。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">八、信息的保留与删除</h2>
        <p className="mb-3">
          我们仅在为实现本政策所述目的所必需的时间内保留您的个人信息，或按法律法规要求的期限保留。
        </p>
        <p className="mb-3">
          当您注销账号后，我们将对您的个人信息按以下方式处理：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>手机号</strong>：脱敏处理后保留90天（用于安全审计和争议处理），之后永久删除</li>
          <li><strong>昵称</strong>：立即删除</li>
          <li><strong>宠物档案</strong>：将被隐藏，其他用户无法查看，相关数据无法恢复</li>
          <li><strong>健康记录</strong>：全部删除，不可恢复</li>
          <li><strong>图片</strong>：30天内从服务器彻底清除</li>
          <li><strong>私信记录</strong>：删除</li>
          <li><strong>位置信息</strong>：删除</li>
          <li><strong>举报记录</strong>：按法规要求保留2年后删除</li>
          <li><strong>发布的内容（帖子、评论）</strong>：可选择匿名化保留或一并删除</li>
        </ul>
        <p className="mb-3">
          法律、行政法规另有规定的，从其规定。账号注销操作不可逆，请在注销前备份您需要保留的信息。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">九、您的权利</h2>
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

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">十、Cookie的使用</h2>
        <p className="mb-3">
          我们使用必要的Cookie来维持您的登录状态和会话安全。我们不使用Cookie进行跨站追踪或广告投放。您可以通过浏览器设置管理或禁用Cookie，但这可能影响平台部分功能的正常使用。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">十一、未成年人保护</h2>
        <p className="mb-3">
          本平台主要面向年满18周岁的用户。如您未满18周岁，请在监护人陪同下阅读本政策并使用本平台。如我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们将及时删除。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">十二、政策的更新</h2>
        <p className="mb-3">
          我们可能会不时更新本隐私政策。更新后的政策将在平台公布，重大变更将通过站内通知或其他适当方式告知。请您定期查看本政策。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">十三、联系我们</h2>
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
