'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HealthDisclaimerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" aria-label="返回" />
        </button>
        <h1 className="text-lg font-semibold">健康免责声明</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 prose prose-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400 mb-6">最后更新日期：2026年5月1日</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">
            重要提示：请在使用AI健康助手前仔细阅读本声明。使用PetPal的AI健康助手功能即表示您已充分理解并同意本声明的全部内容。
          </p>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">一、AI健康助手的性质与限制</h2>
        <p className="mb-3">
          PetPal提供的AI健康助手（以下简称"本功能"）是基于人工智能技术开发的辅助信息工具，旨在为宠物主人提供宠物健康相关的参考信息和建议。
        </p>
        <p className="mb-3">
          <strong className="text-red-600">本功能不是兽医、不是医疗设备、不是诊断工具，其提供的任何信息、建议或分析均不构成兽医诊断、处方或治疗建议。</strong>
        </p>
        <p className="mb-3">
          AI生成的内容可能存在以下局限：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>信息可能不准确、不完整或已过时</li>
          <li>无法考虑您宠物的完整病史和个体差异</li>
          <li>无法进行体格检查或实验室检测</li>
          <li>建议可能基于不完整的信息推断</li>
          <li>可能无法识别紧急或危重情况</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">二、不替代专业兽医诊断</h2>
        <p className="mb-3">
          AI健康助手提供的任何建议不能替代持证兽医的专业诊断、治疗和建议。宠物的任何健康问题都应由持证兽医进行诊断和处理。
        </p>
        <p className="mb-3">
          在以下情况下，您必须立即咨询持证兽医，而非依赖AI健康助手的建议：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>宠物出现持续呕吐、腹泻、食欲不振等症状</li>
          <li>宠物出现呼吸困难、抽搐、昏迷等紧急症状</li>
          <li>宠物有明显外伤、骨折或出血</li>
          <li>宠物精神状态明显异常</li>
          <li>宠物的慢性疾病症状突然加重</li>
          <li>您对宠物的健康状况有任何担忧</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">三、紧急情况处理</h2>
        <p className="mb-3">
          <strong className="text-red-600">如您的宠物出现任何紧急情况（如呼吸困难、严重外伤、中毒、抽搐、意识丧失等），请立即联系最近的宠物医院或兽医急救中心，不要依赖AI健康助手获取紧急处理建议。</strong>
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">四、用户责任</h2>
        <p className="mb-3">
          使用AI健康助手即表示您理解并同意：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>您对宠物的健康管理和医疗决策承担全部责任</li>
          <li>您应在专业兽医指导下进行任何宠物健康相关的决策和操作</li>
          <li>您应对向AI健康助手提供的信息准确性负责</li>
          <li>AI健康助手的使用并不能建立医患关系</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">五、健康记录功能说明</h2>
        <p className="mb-3">
          PetPal提供的健康记录管理功能（包括体重记录、疫苗记录、驱虫记录、就诊记录等）是为方便用户管理宠物健康信息而设计的辅助工具。该功能不构成健康评估或诊断。用户应自行核实记录信息的准确性。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">六、免责条款</h2>
        <p className="mb-3">
          在法律允许的最大范围内，PetPal及其关联方对以下情况不承担任何责任：
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>因使用或依赖AI健康助手提供的信息而直接或间接导致的任何损失或损害</li>
          <li>因AI健康助手信息不准确、不完整或延迟导致的任何后果</li>
          <li>因用户未及时就医而导致的宠物健康恶化或损失</li>
          <li>因健康记录信息录入错误或丢失导致的任何后果</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">七、声明的更新</h2>
        <p className="mb-3">
          我们可能会不时更新本免责声明。更新后的声明将在平台公布，届时使用本功能即表示接受更新后的条款。
        </p>

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">八、联系我们</h2>
        <p className="mb-3">
          如您对本声明有任何疑问，请通过以下方式联系我们：
        </p>
        <p className="text-brand-600">
          邮箱：support@petpal.app
        </p>
      </div>
    </div>
  );
}
