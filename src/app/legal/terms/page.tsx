'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">用户协议</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 prose prose-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400 mb-6">最后更新日期：2026年5月1日</p>

        <p className="mb-4">
          欢迎使用PetPal（以下简称"本平台"）。请您在使用本平台服务前仔细阅读本用户协议（以下简称"本协议"）。您使用本平台服务即表示您已充分阅读、理解并同意受本协议约束。如您不同意本协议任何条款，请立即停止使用本平台服务。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">一、服务说明</h2>
        <p className="mb-3">
          PetPal是一个面向宠物主人的社交与健康管理平台，提供以下服务：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>宠物档案创建与管理</li>
          <li>宠物社区交流与内容分享</li>
          <li>宠物健康记录管理与健康建议</li>
          <li>附近宠物场所发现与评价</li>
          <li>宠物社交与约玩功能</li>
          <li>AI健康助手咨询服务</li>
        </ul>
        <p className="mb-3">
          本平台保留在不事先通知的情况下，随时修改或中断服务的权利。对于因服务中断或变更给用户造成的任何损失，本平台不承担责任。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">二、账号规则</h2>
        <p className="mb-3">
          用户注册时需提供真实有效的手机号码。每个手机号码仅限注册一个账号。用户应对其账号下的所有行为承担全部责任。
        </p>
        <p className="mb-3">
          用户不得将账号出借、转让或与他人共用。如因用户保管不当导致账号被盗用，本平台不承担责任。如发现账号异常，请立即联系客服。
        </p>
        <p className="mb-3">
          用户有权随时申请注销账号。注销后，该账号下的宠物档案将被隐藏，手机号将被脱敏处理，相关数据无法恢复。请谨慎操作。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">三、内容发布规范</h2>
        <p className="mb-3">
          用户在本平台发布内容（包括但不限于文字、图片、评论、私信）时，应遵守以下规范：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>不得发布违反法律法规的内容</li>
          <li>不得发布色情、暴力、恐怖等不良信息</li>
          <li>不得发布侮辱、诽谤、骚扰他人的内容</li>
          <li>不得发布垃圾广告或商业推广信息</li>
          <li>不得冒充他人或机构身份</li>
          <li>不得发布虚假、误导性信息</li>
          <li>不得侵犯他人知识产权或其他合法权益</li>
        </ul>
        <p className="mb-3">
          本平台有权对违规内容进行删除、屏蔽或修改，并有权对违规用户采取警告、限制功能、暂停或永久封禁账号等措施。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">四、用户承诺</h2>
        <p className="mb-3">
          用户承诺在使用本平台服务过程中，遵守所有适用的法律法规和社会公德。用户承诺对其发布的内容真实性负责，特别是涉及宠物医疗、健康建议等内容时，应注明信息来源。
        </p>
        <p className="mb-3">
          用户承诺通过本平台进行的线下约玩活动，自行评估安全风险并承担相应责任。本平台仅提供信息撮合服务，不对线下活动的安全性承担责任。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">五、知识产权</h2>
        <p className="mb-3">
          本平台的所有内容，包括但不限于软件、界面设计、文字、图片、图标、音频、视频、数据等，均受知识产权相关法律保护。未经本平台书面许可，任何人不得以任何方式使用、复制、修改、传播。
        </p>
        <p className="mb-3">
          用户在本平台发布的内容，视为授予本平台在全球范围内免费、永久、不可撤销的使用许可，包括但不限于复制、展示、传播、改编等权利。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">六、责任限制</h2>
        <p className="mb-3">
          本平台按"现状"提供服务，不对服务的及时性、安全性、准确性和完整性作任何明示或默示的保证。
        </p>
        <p className="mb-3">
          在任何情况下，本平台对用户的任何直接、间接、附带、特殊或后果性损失不承担责任，包括但不限于利润损失、数据丢失、业务中断等，无论该损失是否可预见。
        </p>
        <p className="mb-3">
          本平台对以下情况不承担责任：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>因网络故障、黑客攻击、病毒等原因导致的服务中断或数据泄露</li>
          <li>用户之间因使用本平台产生的纠纷</li>
          <li>AI健康助手提供的建议导致的任何后果</li>
          <li>因不可抗力导致的服务中断</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">七、协议修改</h2>
        <p className="mb-3">
          本平台有权根据需要修改本协议条款。修改后的协议将在平台公布，并自公布之日起生效。用户继续使用本平台服务即视为同意修改后的协议。如用户不同意修改内容，应停止使用本平台服务。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">八、争议解决</h2>
        <p className="mb-3">
          本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，应首先通过友好协商解决；协商不成的，任何一方均可向本平台运营方所在地有管辖权的法院提起诉讼。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">九、联系我们</h2>
        <p className="mb-3">
          如您对本协议有任何疑问或建议，请通过以下方式联系我们：
        </p>
        <p className="text-brand-600">
          邮箱：support@petpal.app
        </p>
      </div>
    </div>
  );
}
