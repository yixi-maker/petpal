'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommunityGuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-border-light px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-ink-muted" aria-label="返回" />
        </button>
        <h1 className="text-lg font-semibold">社区规范</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 prose prose-sm text-ink leading-relaxed">
        <p className="text-xs text-ink-faded mb-6">最后更新日期：2026年5月1日</p>

        <p className="mb-4">
          PetPal 致力于为宠物主人营造一个友善、安全、互助的社区环境。为确保每位用户的体验和安全，我们制定了以下社区规范。所有用户在使用 PetPal 时均须遵守本规范。违反社区规范的行为将受到相应处置。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">一、禁止内容</h2>

        <p className="mb-3">
          用户在 PetPal 平台发布任何内容（包括但不限于帖子、评论、私信、宠物档案、头像、图片）时，严禁包含以下内容：
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.1 违法违规内容</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>违反《中华人民共和国网络安全法》《中华人民共和国个人信息保护法》《中华人民共和国数据安全法》等法律法规的内容</li>
          <li>危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一的内容</li>
          <li>煽动民族仇恨、民族歧视，破坏民族团结的内容</li>
          <li>宣扬邪教和封建迷信的内容</li>
          <li>散布谣言、扰乱社会秩序、破坏社会稳定的内容</li>
          <li>传播淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的内容</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.2 骚扰与辱骂</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>针对他人进行辱骂、侮辱、诽谤或人身攻击</li>
          <li>发布带有明显恶意或挑衅性质的内容</li>
          <li>持续骚扰、跟踪、恐吓其他用户</li>
          <li>在私信中发送骚扰信息或图片</li>
          <li>以任何形式煽动他人攻击特定用户或群体</li>
          <li>基于地域、性别、职业等特征发布歧视性言论</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.3 欺诈与引流</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>发布虚假宠物领养、配种、售卖信息进行诈骗</li>
          <li>冒充平台官方人员或其他用户进行诈骗</li>
          <li>发布投资理财、刷单返利、兼职招聘等虚假信息</li>
          <li>引导用户添加外部社交账号进行站外交易或引流</li>
          <li>发布包含钓鱼链接或恶意代码的内容</li>
          <li>利用平台进行传销、非法集资等违法活动</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.4 他人隐私</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>未经他人同意，公开他人的真实姓名、手机号码、住址、工作单位等个人信息</li>
          <li>发布包含他人清晰面容的照片或视频而未获得授权</li>
          <li>公开他人的私信对话记录</li>
          <li>利用平台收集或爬取其他用户的个人信息</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">1.5 危险及不当医疗建议</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>发布可能对宠物造成伤害的危险行为示范或建议</li>
          <li>以专业兽医身份发布确诊、处方、用药剂量等医疗建议（实际不具备执业资质）</li>
          <li>推广未经科学验证或可能有害的宠物"偏方"</li>
          <li>声称某种方法或产品可以保证治愈宠物疾病</li>
          <li>劝阻他人为宠物寻求专业兽医帮助</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">二、举报机制</h2>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">2.1 如何举报</h3>
        <p className="mb-3">
          如您发现任何违反社区规范的内容或行为，可以通过以下方式进行举报：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>在帖子或评论处点击"举报"按钮，选择举报原因并提交</li>
          <li>在用户主页点击"举报用户"，选择举报原因并提交</li>
          <li>通过私信内容的举报入口进行举报</li>
          <li>发送邮件至 report@petpal.app 进行举报，请附上相关截图或证据</li>
        </ul>
        <p className="mb-3">
          请在举报时提供尽可能详细的信息，包括违规内容的截图、链接和具体的违规事由，以便我们能够及时、准确地进行处理。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">2.2 处理流程</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>初步审核</strong>：收到举报后，平台管理员将对举报内容进行初步审核，判断举报是否成立</li>
          <li><strong>调查核实</strong>：对于需要进一步调查的举报，管理员将查看相关内容的上下文、历史记录等，综合判断是否存在违规行为</li>
          <li><strong>作出处理</strong>：根据调查结果，依据本规范的处置措施条款作出相应处理决定</li>
          <li><strong>通知反馈</strong>：处理完成后，举报人将收到处理结果通知（如举报人提供了联系方式）</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">2.3 处理时效</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>一般举报：24 小时内完成初步审核</li>
          <li>紧急举报（涉及人身安全、严重违法等）：4 小时内优先处理</li>
          <li>复杂举报（需多方核实）：3 个工作日内作出处理决定</li>
          <li>处理结果将通过站内通知或邮件告知举报人</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">三、处置措施</h2>

        <p className="mb-3">
          对于违反社区规范的行为，平台将根据违规情节的严重程度和频率，采取以下一项或多项处置措施：
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">3.1 警告</h3>
        <p className="mb-3">
          对于首次轻微违规的用户，平台将发送警告通知，告知其违规行为并要求其自行整改。警告期间，用户的部分功能可能受到限制。用户在收到警告后应及时删除或修改违规内容。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">3.2 内容隐藏</h3>
        <p className="mb-3">
          对于涉及违规的帖子、评论、图片等内容，平台有权将其设置为隐藏状态。被隐藏的内容仅发布者本人可见，其他用户无法查看。内容被隐藏后，发布者可以进行申诉或修改后申请恢复。
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">3.3 账号限制</h3>
        <p className="mb-3">
          对于多次违规或中度违规的用户，平台将对其账号采取限制措施，包括但不限于：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>禁止发布新内容（禁言）：一定期限内无法发布帖子、评论或私信</li>
          <li>限制社交功能：无法使用私信、关注、约玩等功能</li>
          <li>降低内容曝光：发布的内容将被限制在推荐流中的曝光量</li>
          <li>限制期限视违规严重程度而定，通常为 1 天至 30 天</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">3.4 账号封禁</h3>
        <p className="mb-3">
          对于严重违规、多次违规屡教不改或涉及违法犯罪行为的用户，平台将永久封禁其账号。被封禁的账号将无法登录和使用 PetPal 的任何服务。封禁后：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>该账号发布的所有内容将被批量隐藏</li>
          <li>该账号的宠物档案将被隐藏</li>
          <li>该账号的手机号将被列入黑名单，无法重新注册</li>
        </ul>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">四、申诉渠道</h2>

        <p className="mb-3">
          如您认为平台的处置决定有误或不合理，您有权通过以下渠道提出申诉：
        </p>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">4.1 申诉方式</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li><strong>站内申诉</strong>：在收到处置通知后，通过通知中的"申诉"入口提交申诉申请，说明申诉理由并提供相关证据</li>
          <li><strong>邮件申诉</strong>：发送申诉邮件至 appeal@petpal.app，邮件中请注明您的注册手机号、被处置的账号信息以及申诉理由</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">4.2 申诉处理流程</h3>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>平台将在收到申诉后 3 个工作日内进行复核</li>
          <li>复核期间，原处置措施继续有效</li>
          <li>复核人员将独立审查相关内容和处置依据，不受原处理人员影响</li>
          <li>复核结果将通过站内通知或邮件告知申诉人</li>
          <li>如申诉成立，平台将撤销原处置措施并恢复相关内容或功能</li>
          <li>如申诉不成立，平台将说明维持原处置的理由</li>
        </ul>

        <h3 className="text-sm font-medium text-ink mt-5 mb-2">4.3 外部投诉</h3>
        <p className="mb-3">
          如您对平台的申诉处理结果仍有异议，您可以依据相关法律法规向网信办、通信管理局等监管部门进行投诉举报。
        </p>

        <h2 className="text-base font-semibold text-ink mt-8 mb-3">五、联系我们</h2>
        <p className="mb-3">
          如您对本社区规范有任何疑问、建议或需要举报违规内容，请通过以下方式联系我们：
        </p>
        <p className="text-teal-600">
          举报邮箱：report@petpal.app<br />
          申诉邮箱：appeal@petpal.app<br />
          客服邮箱：support@petpal.app
        </p>
      </div>
    </div>
  );
}
