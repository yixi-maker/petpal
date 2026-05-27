import type { AITriageRequest, AITriageResult } from './ai-provider';

const DISCLAIMER =
  'AI 健康助手结果仅供健康咨询和初步分诊参考，不能替代执业兽医诊断。\n如您的宠物出现以下情况，请立即前往宠物医院就诊：呼吸困难、严重外伤、持续呕吐/腹泻、意识模糊、中毒可能、超过 24 小时拒食。';

const HIGH_KEYWORDS = [
  '吐血', '抽搐', '昏迷', '中毒', '车祸', '呼吸困难',
  '瘫痪', '尿血', '便血', '高温',
];

const MEDIUM_KEYWORDS = [
  '呕吐', '腹泻', '不吃', '跛行', '频繁抓痒', '咳嗽',
  '打喷嚏', '流泪', '掉毛', '精神差',
];

function detectRiskLevel(symptoms: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  const lower = symptoms.toLowerCase();
  for (const kw of HIGH_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return 'HIGH';
  }
  for (const kw of MEDIUM_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return 'MEDIUM';
  }
  return 'LOW';
}

function buildHighResult(): AITriageResult {
  return {
    id: `triage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    riskLevel: 'HIGH',
    possibleConditions: [
      '可能存在需要紧急处理的急性疾病或损伤',
      '可能涉及中毒反应或严重感染',
      '可能为器官功能异常或衰竭的临床表现',
    ],
    homeCareAdvice: [
      '请立即停止自行处理，避免耽误最佳救治时机',
      '保持宠物安静、温暖，避免剧烈移动',
      '如已知误食有毒物质，请带上包装或样本前往医院',
      '可用干净毛巾对出血部位进行简单压迫止血',
    ],
    shouldSeeVet: true,
    urgencyNote: '您的宠物症状描述中出现了高危警示信号，建议立即前往最近的正规宠物医院急诊就诊，不要等待。',
    precautions: [
      '请勿自行给宠物饲喂任何药物或食物',
      '运输途中注意固定宠物，避免二次伤害',
      '如宠物出现惊厥，请勿将手放入其口中',
      '记录症状出现的时间点，便于兽医判断病程',
    ],
    disclaimer: DISCLAIMER,
  };
}

function buildMediumResult(request: AITriageRequest): AITriageResult {
  const withVomiting = request.isVomiting;
  const withInjury = request.hasInjury;
  const lowAppetite = request.appetite === '废绝' || request.appetite === '减退';
  const lowEnergy = request.energy === '嗜睡';
  const longDuration = request.duration === '1-2周' || request.duration === '>2周';

  const possibleConditions: string[] = [];
  const homeCareAdvice: string[] = [];
  const urgencyParts: string[] = [];

  if (withVomiting || request.symptoms.includes('呕吐')) {
    possibleConditions.push('可能为消化道炎症或饮食不当引起的胃肠道反应');
    homeCareAdvice.push('暂时禁食 4-6 小时，少量多次给予清洁饮水，观察呕吐频率');
    urgencyParts.push('宠物存在呕吐症状');
  }
  if (request.symptoms.includes('腹泻') || request.bowelMovement?.includes('稀')) {
    possibleConditions.push('可能为肠道菌群紊乱或消化不良引起的腹泻');
    homeCareAdvice.push('可暂时给予清淡易消化的食物，保证饮水充足');
    urgencyParts.push('有腹泻表现');
  }
  if (lowAppetite || request.symptoms.includes('不吃')) {
    possibleConditions.push('食欲减退可能与口腔问题、消化系统不适或全身性疾病相关');
    homeCareAdvice.push('尝试提供宠物喜爱的食物，观察进食意愿是否有变化');
  }
  if (lowEnergy || request.symptoms.includes('精神差')) {
    possibleConditions.push('精神状态下降可能提示存在潜在健康问题');
    homeCareAdvice.push('为宠物提供安静舒适的环境，减少外界刺激');
  }
  if (withInjury || request.symptoms.includes('跛行')) {
    possibleConditions.push('可能存在肢体损伤或关节问题');
    homeCareAdvice.push('限制宠物活动范围，避免跑跳，观察跛行程度变化');
    urgencyParts.push('存在肢体受伤或异常步态');
  }
  if (request.symptoms.includes('咳嗽') || request.symptoms.includes('打喷嚏')) {
    possibleConditions.push('可能与上呼吸道刺激或感染有关');
    homeCareAdvice.push('保持室内通风、湿度适中，避免烟尘等刺激物');
  }
  if (request.symptoms.includes('频繁抓痒') || request.symptoms.includes('掉毛')) {
    possibleConditions.push('可能与皮肤问题、寄生虫或过敏有关');
    homeCareAdvice.push('检查宠物皮肤有无红疹、结痂或寄生虫迹象');
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push('根据描述的症状，可能存在需要关注的健康问题');
  }
  if (homeCareAdvice.length === 0) {
    homeCareAdvice.push('密切观察宠物症状变化，记录异常表现');
  }

  let urgencyNote: string | undefined;
  if (longDuration) {
    urgencyParts.push('症状持续时间较长');
  }
  if (urgencyParts.length > 0) {
    urgencyNote = `${urgencyParts.join('、')}，建议尽快预约宠物医院就诊检查。`;
  } else {
    urgencyNote = '如症状在 24-48 小时内未见好转或加重，建议及时就医。';
  }

  return {
    id: `triage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    riskLevel: 'MEDIUM',
    possibleConditions,
    homeCareAdvice,
    shouldSeeVet: !!(longDuration || withVomiting || withInjury),
    urgencyNote,
    precautions: [
      '不要给宠物自行使用任何人类药品',
      '密切观察症状的频率和严重程度变化',
      '如出现新的症状或原有症状加重，请及时就医',
      '保持宠物饮水和如厕记录，便于就诊时向兽医提供',
    ],
    disclaimer: DISCLAIMER,
  };
}

function buildLowResult(request: AITriageRequest): AITriageResult {
  const possibleConditions: string[] = [];
  const homeCareAdvice: string[] = [];

  if (request.symptoms.includes('流泪')) {
    possibleConditions.push('可能与眼部轻微刺激或泪腺分泌异常有关');
    homeCareAdvice.push('用清洁的温湿棉片轻轻擦拭眼周分泌物');
  }
  if (request.symptoms.includes('掉毛')) {
    possibleConditions.push('季节性换毛或日常代谢性掉毛可能性较大');
    homeCareAdvice.push('定期梳理毛发，保持皮毛清洁卫生');
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push('根据当前描述的症状，暂未发现高风险预警信号');
  }
  if (homeCareAdvice.length === 0) {
    homeCareAdvice.push('继续保持日常护理，观察宠物有无新增异常');
    homeCareAdvice.push('确保宠物饮食均衡、饮水充足、环境干净');
  }

  return {
    id: `triage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    riskLevel: 'LOW',
    possibleConditions,
    homeCareAdvice,
    shouldSeeVet: false,
    urgencyNote: '根据当前描述的症状，暂不建议紧急就医。请持续观察，如症状持续或加重，再考虑前往医院检查。',
    precautions: [
      '观察宠物的精神状态和食欲有无变化',
      '保持环境清洁，避免接触可能的过敏原',
      '确保疫苗接种和驱虫按时进行',
    ],
    disclaimer: DISCLAIMER,
  };
}

export async function getMockAITriage(request: AITriageRequest): Promise<AITriageResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

  const riskLevel = detectRiskLevel(request.symptoms);

  switch (riskLevel) {
    case 'HIGH':
      return buildHighResult();
    case 'MEDIUM':
      return buildMediumResult(request);
    case 'LOW':
    default:
      return buildLowResult(request);
  }
}
