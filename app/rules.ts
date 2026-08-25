export type AgeUnit = "days" | "months" | "years";

export type RiskLevel = "secondary" | "recommended" | "consider" | "monitor" | "not-routine";
export type Diagnosis = "" | "ALL" | "AML" | "lymphoma" | "MDS" | "CML" | "other";
export type DiseaseRisk = "" | "low" | "intermediate" | "high";
export type TreatmentStage = "" | "induction" | "consolidation" | "maintenance" | "refractory-relapse" | "hsct";
export type ImmuneTherapy = "car-t" | "b-cell" | "atg" | "checkpoint" | "immunomodulator" | "small-molecule" | "calcineurin-mtor" | "other";
export type AdditionalFactor = "mucositis" | "primary-immunodeficiency" | "severe-viral" | "lung-structure" | "diabetes" | "qtc";

export type QuestionnaireInputs = {
  diagnosis: Diagnosis;
  allSubtype: "" | "B-ALL" | "T-ALL" | "NK-ALL" | "MPAL" | "other";
  phStatus: "" | "positive" | "negative";
  amlSubtype: "" | "M0" | "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "other";
  lymphomaSubtype: "" | "cHL" | "NLPHL" | "BL" | "DLBCL" | "PMBCL" | "T-LBL" | "ALCL" | "other";
  mdsSubtype: "" | "MDS-LB" | "MDS-IB" | "other";
  diseaseRisk: DiseaseRisk;
  lymphomaStage: "" | "I-II" | "III-IV";
  lymphomaHighRisk: "" | "yes" | "no";
  cmlPhase: "" | "chronic" | "accelerated" | "blast" | "other";
  treatmentStage: TreatmentStage;
  hsctType: "" | "allo" | "auto";
  hsctStage: "" | "pre" | "post";
  gvhdStatus: "" | "none" | "acute-I-II" | "acute-III-IV" | "chronic";
  immuneTherapies: ImmuneTherapy[];
  smallMoleculeTherapies: string[];
  calcineurinMtorTherapies: string[];
  additionalFactors: AdditionalFactor[];
  neutropeniaOver10Days: boolean;
  neutropeniaOver14Days: boolean;
  steroidExposure: boolean;
  invasiveDevice: boolean;
  azoleIssue: boolean;
};

export type RiskInputs = {
  currentIfd: boolean;
  imagingOrMarkerPositive: boolean;
  previousIfd: boolean;
  hsct: boolean;
  preEngraftment: boolean;
  alloHsctWithGvhdOrTherapy: boolean;
  systemicImmuneTherapy: boolean;
  atg: boolean;
  leukemia: boolean;
  aml: boolean;
  amlHighRisk: boolean;
  highRiskAll: boolean;
  consolidationOrIntensification: boolean;
  inductionRefractoryRelapse: boolean;
  hodgkinLymphoma: boolean;
  generalRiskFactor: boolean;
};

export type RiskResult = {
  level: RiskLevel;
  riskBand: "IFD相关高危" | "高危" | "中危" | "需密切监测" | "未命中高危条件";
  title: string;
  detail: string;
  trace: string[];
};

export type DrugName = "泊沙康唑" | "伏立康唑" | "米卡芬净" | "氟康唑" | "艾沙康唑" | "伊曲康唑" | "卡泊芬净" | "脂质体两性霉素B";
export type DrugCandidate = { name: DrugName; rank: "首选" | "推荐" | "可考虑" | "条件使用" | "不推荐"; note?: string; offLabel?: boolean };
export type RenalStatus = "" | "normal" | "impaired" | "dialysis";
export type HepaticStatus = "" | "normal" | "abnormal" | "child-ab" | "child-c";
export type MedicationKey =
  | "enzyme-inducer" | "phenytoin" | "rifabutin" | "sirolimus" | "tacrolimus" | "cyclosporine"
  | "everolimus" | "venetoclax" | "statin" | "benzodiazepine" | "vinca" | "digoxin"
  | "macrolide" | "qt-drugs" | "fluconazole" | "warfarin" | "omeprazole40" | "fentanyl"
  | "sulfonylurea" | "nifedipine" | "ritonavir-high" | "prednisone-pioglitazone"
  | "cyclophosphamide" | "anthracycline-imatinib" | "nephrotoxic" | "potassium-diuretic";
export type OrganMedicationInputs = { renalStatus: RenalStatus; hepaticStatus: HepaticStatus; medications: MedicationKey[] };

export const initialQuestionnaire: QuestionnaireInputs = {
  diagnosis: "", allSubtype: "", phStatus: "", amlSubtype: "", lymphomaSubtype: "", mdsSubtype: "",
  diseaseRisk: "", lymphomaStage: "", lymphomaHighRisk: "", cmlPhase: "", treatmentStage: "",
  hsctType: "", hsctStage: "", gvhdStatus: "", immuneTherapies: [], smallMoleculeTherapies: [],
  calcineurinMtorTherapies: [], additionalFactors: [], neutropeniaOver10Days: false,
  neutropeniaOver14Days: false, steroidExposure: false, invasiveDevice: false, azoleIssue: false,
};

export function ageToMonths(value: number, unit: AgeUnit): number {
  if (!Number.isFinite(value) || value < 0) return Number.NaN;
  if (unit === "years") return value * 12;
  if (unit === "days") return value / 30.4375;
  return value;
}

export function ageToDays(value: number, unit: AgeUnit): number {
  if (!Number.isFinite(value) || value < 0) return Number.NaN;
  if (unit === "years") return value * 365.25;
  if (unit === "months") return value * 30.4375;
  return value;
}

export function bodySurfaceArea(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return Number.NaN;
  return Math.sqrt((weightKg * heightCm) / 3600);
}

export function deriveRiskInputs(questionnaire: QuestionnaireInputs, ageMonths: number, ifd: Pick<RiskInputs, "currentIfd" | "imagingOrMarkerPositive" | "previousIfd">): RiskInputs {
  const diagnosis = questionnaire.diagnosis;
  const anyImmuneTherapy = questionnaire.immuneTherapies.length > 0;
  const hasGvhd = questionnaire.gvhdStatus !== "" && questionnaire.gvhdStatus !== "none";
  const allHighRisk = diagnosis === "ALL" && (questionnaire.diseaseRisk === "high" || questionnaire.allSubtype === "T-ALL" || questionnaire.phStatus === "positive" || (Number.isFinite(ageMonths) && ageMonths < 12));
  return {
    ...ifd,
    hsct: questionnaire.treatmentStage === "hsct",
    preEngraftment: questionnaire.treatmentStage === "hsct" && questionnaire.hsctStage === "pre",
    alloHsctWithGvhdOrTherapy: questionnaire.treatmentStage === "hsct" && questionnaire.hsctType === "allo" && (hasGvhd || anyImmuneTherapy),
    systemicImmuneTherapy: anyImmuneTherapy,
    atg: questionnaire.immuneTherapies.includes("atg"),
    leukemia: diagnosis === "ALL" || diagnosis === "AML" || diagnosis === "CML",
    aml: diagnosis === "AML",
    amlHighRisk: diagnosis === "AML" && questionnaire.diseaseRisk === "high",
    highRiskAll: allHighRisk,
    consolidationOrIntensification: questionnaire.treatmentStage === "consolidation",
    inductionRefractoryRelapse: questionnaire.treatmentStage === "induction" || questionnaire.treatmentStage === "refractory-relapse",
    hodgkinLymphoma: diagnosis === "lymphoma" && (questionnaire.lymphomaSubtype === "cHL" || questionnaire.lymphomaSubtype === "NLPHL"),
    generalRiskFactor: questionnaire.additionalFactors.length > 0 || questionnaire.neutropeniaOver10Days || questionnaire.neutropeniaOver14Days || questionnaire.steroidExposure || questionnaire.invasiveDevice,
  };
}

export function deriveDiseaseRiskLabel(questionnaire: QuestionnaireInputs, ageMonths: number) {
  if (!questionnaire.diagnosis) return { label: "待填写", detail: "请选择最主要疾病诊断和对应风险信息。" };
  if (questionnaire.diagnosis === "ALL") {
    const reasons: string[] = [];
    if (questionnaire.diseaseRisk === "high") reasons.push("疾病风险选择高危");
    if (questionnaire.allSubtype === "T-ALL") reasons.push("T-ALL");
    if (questionnaire.phStatus === "positive") reasons.push("Ph阳性");
    if (Number.isFinite(ageMonths) && ageMonths < 12) reasons.push("年龄小于1岁");
    if (reasons.length) return { label: "高危", detail: reasons.join("；") };
  }
  if (["ALL", "AML", "MDS"].includes(questionnaire.diagnosis)) {
    const labels: Record<DiseaseRisk, string> = { "": "待填写", low: "低危", intermediate: "中危", high: "高危" };
    return { label: labels[questionnaire.diseaseRisk], detail: "按所填疾病风险分级显示。" };
  }
  if (questionnaire.diagnosis === "lymphoma") {
    if (!questionnaire.lymphomaHighRisk) return { label: "待填写", detail: "请填写淋巴瘤分期及是否高危。" };
    return { label: questionnaire.lymphomaHighRisk === "yes" ? "高危" : "非高危", detail: questionnaire.lymphomaStage ? `疾病分期：${questionnaire.lymphomaStage}期` : "疾病分期尚未填写。" };
  }
  if (questionnaire.diagnosis === "CML") {
    const labels = { "": "待填写", chronic: "慢性期", accelerated: "加速期", blast: "急变期", other: "其他/不详" };
    return { label: labels[questionnaire.cmlPhase], detail: "按所填CML疾病阶段显示。" };
  }
  return { label: "未分级", detail: "当前诊断没有配置疾病风险分级规则。" };
}

export function evaluatePrevention(input: RiskInputs): RiskResult {
  const ifdSignals: string[] = [];
  if (input.currentIfd) ifdSignals.push("当前确诊或疑似IFD");
  if (input.imagingOrMarkerPositive) ifdSignals.push("影像学改变或G/GM试验阳性");
  if (input.previousIfd) ifdSignals.push("既往IFD史");
  if (ifdSignals.length > 0) return { level: "secondary", riskBand: "IFD相关高危", title: "推荐进行二级预防", detail: "本结果按资料提供者确认的原始流程输出；当前活动性或疑似感染仍需由临床团队另行判断诊疗路径。", trace: ifdSignals };
  if (input.hsct) {
    if (input.preEngraftment) return { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: "预防与移植前预处理同时开始，原始流程建议至少持续至移植后3个月。", trace: ["正在进行造血干细胞移植", "处于植入前阶段"] };
    if (input.alloHsctWithGvhdOrTherapy) return { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: "异基因HSCT并合并GVHD或正在接受免疫/靶向治疗。", trace: ["异基因造血干细胞移植", "合并GVHD或免疫/靶向治疗"] };
    return input.generalRiskFactor
      ? { level: "consider", riskBand: "中危", title: "可考虑进行预防", detail: "存在资料列出的至少一项附加危险因素。", trace: ["造血干细胞移植", "合并附加危险因素"] }
      : { level: "not-routine", riskBand: "未命中高危条件", title: "不推荐常规预防", detail: "未命中原始流程中的移植后高危条件。", trace: ["造血干细胞移植", "未合并所列高危条件"] };
  }
  if (input.systemicImmuneTherapy || input.atg) {
    return {
      level: "recommended",
      riskBand: "高危",
      title: "推荐进行抗真菌预防",
      detail: input.atg ? "正在接受ATG。" : "正在接受全身免疫治疗或淋巴细胞靶向治疗。",
      trace: input.atg
        ? ["全身免疫治疗或淋巴细胞靶向治疗", "接受ATG"]
        : ["全身免疫治疗或淋巴细胞靶向治疗"],
    };
  }
  if (input.leukemia) {
    if (input.aml) {
      if (input.amlHighRisk) return { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: "预防需覆盖预期的严重中性粒细胞减少期。", trace: ["白血病", "AML", "高危"] };
      return input.generalRiskFactor
        ? { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: "AML并合并资料列出的附加危险因素。", trace: ["白血病", "AML", "合并附加危险因素"] }
        : { level: "consider", riskBand: "中危", title: "个体化评估后可考虑预防", detail: "需结合化疗强度、黏膜炎风险等因素进行个体化评估。", trace: ["白血病", "AML", "未命中明确高危条件"] };
    }
    if (input.highRiskAll) return { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: input.consolidationOrIntensification ? "当前处于巩固/强化化疗阶段，为预防重点覆盖期。" : "命中高危/T细胞/婴儿/费城染色体阳性ALL条件。", trace: ["白血病", "高危/T细胞/婴儿/费城染色体阳性ALL", input.consolidationOrIntensification ? "巩固/强化化疗" : "其他治疗阶段"] };
    if (input.inductionRefractoryRelapse) return { level: "recommended", riskBand: "高危", title: "推荐进行抗真菌预防", detail: "预防需结合既往治疗史、免疫抑制状态综合评估。", trace: ["白血病", "诱导/难治/复发治疗阶段"] };
    return input.generalRiskFactor
      ? { level: "consider", riskBand: "中危", title: "可考虑进行预防", detail: "白血病并合并资料列出的附加危险因素。", trace: ["白血病", "合并附加危险因素"] }
      : { level: "not-routine", riskBand: "未命中高危条件", title: "不推荐常规预防", detail: "未命中原始流程中的明确预防条件。", trace: ["白血病", "未命中明确高危条件"] };
  }
  if (input.hodgkinLymphoma && input.generalRiskFactor) return { level: "consider", riskBand: "中危", title: "可考虑进行预防", detail: "霍奇金淋巴瘤并合并资料列出的附加危险因素。", trace: ["霍奇金淋巴瘤", "合并附加危险因素"] };
  return { level: "not-routine", riskBand: "未命中高危条件", title: "不推荐常规预防", detail: "未命中原始流程中的明确预防条件。", trace: ["未命中白血病、移植、免疫治疗等明确路径"] };
}

export function selectDrugCandidates(options: { preventionLevel: RiskLevel; patientAgeMonths: number; imagingOrMarkerPositive: boolean; amlInduction: boolean; hsct: boolean; prolongedNeutropenia: boolean; qtcProlonged: boolean; azoleContraindicatedOrPoorAbsorption: boolean }): DrugCandidate[] {
  if (options.preventionLevel === "not-routine" || options.preventionLevel === "monitor") return [];
  if (options.imagingOrMarkerPositive) return [{ name: "伏立康唑", rank: "首选", note: "按原始药物选择流程输出" }];
  const drugs: DrugCandidate[] = [];
  if (options.amlInduction) drugs.push({ name: "泊沙康唑", rank: "推荐" });
  else if (options.hsct || options.prolongedNeutropenia) {
    drugs.push({ name: "泊沙康唑", rank: "推荐" }, { name: "伏立康唑", rank: "推荐" });
    if (options.azoleContraindicatedOrPoorAbsorption) drugs.push({ name: "米卡芬净", rank: "条件使用", note: "唑类禁忌或胃肠道吸收不良" });
  } else drugs.push({ name: "氟康唑", rank: "可考虑" });
  if (options.qtcProlonged || options.prolongedNeutropenia) drugs.push({ name: "艾沙康唑", rank: "可考虑", note: options.qtcProlonged ? "QTc间期延长" : "长期中性粒细胞减少", offLabel: Number.isFinite(options.patientAgeMonths) && options.patientAgeMonths < 18 * 12 });
  const seen = new Set<string>();
  return drugs.filter((drug) => seen.has(drug.name) ? false : (seen.add(drug.name), true));
}

function rounded(value: number): number { return Math.round(value * 10) / 10; }
export function calculateMicafungin(weightKg: number) { return weightKg > 0 ? { daily: Math.min(rounded(weightKg), 50), twiceWeekly: rounded(weightKg * 4) } : null; }

export function calculatePosaconazole(formulation: "tablet" | "suspension", ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;
  if (formulation === "tablet") return ageMonths >= 13 * 12
    ? { available: true as const, loading: "首日每次300 mg，每日2次", maintenance: "此后每次300 mg，每日1次" }
    : { available: false as const, reason: "13岁以下未批准用于此类患者，且指南未进行剂量推荐。" };
  if (ageMonths < 1) return { available: false as const, reason: "小于1个月未批准用于此类患者，暂无剂量参考。" };
  if (ageMonths >= 13 * 12) return { available: true as const, dose: 200, frequency: "每日3次", note: "固定剂量" };
  if (weightKg <= 0) return { available: false as const, reason: "请输入有效体重后计算。" };
  return { available: true as const, dose: rounded(weightKg * 6), frequency: "每日3次", note: "6 mg/kg/次；资料未提供单次最大剂量及取整规则" };
}

export function calculateCaspofungin(weightKg: number, heightCm: number) {
  const bsa = bodySurfaceArea(weightKg, heightCm);
  return Number.isFinite(bsa) ? { bsa: rounded(bsa), loading: Math.min(rounded(bsa * 70), 70), maintenance: Math.min(rounded(bsa * 50), 70) } : null;
}

export function calculateVoriconazole(ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;
  if (ageMonths < 24) return { available: false as const, reason: "2岁以下未批准用于此类患者，暂无剂量参考。" };
  const pediatric = ageMonths < 12 * 12 || (ageMonths < 15 * 12 && weightKg < 50);
  if (pediatric) {
    if (weightKg <= 0) return { available: false as const, reason: "请输入有效体重后计算。" };
    return { available: true as const, regimen: "pediatric" as const, dose: Math.min(rounded(weightKg * 9), 350), frequency: "每日2次", note: "9 mg/kg/次，最大单次剂量350 mg" };
  }
  return { available: true as const, regimen: "adolescent" as const, loading: "首日每次400 mg，每日2次", maintenance: "此后每次200 mg，每日2次" };
}

export function calculateFluconazole(ageDays: number, weightKg: number) {
  if (!Number.isFinite(ageDays) || ageDays < 0) return null;
  if (weightKg <= 0) return { available: false as const, reason: "请输入有效体重后计算。" };
  const range = (low: number, high: number) => `${rounded(weightKg * low)}–${Math.min(rounded(weightKg * high), 400)} mg/次`;
  if (ageDays <= 14) return { available: true as const, dose: range(3, 12), frequency: "每72小时1次", note: "3–12 mg/kg/次；最大每72小时12 mg/kg" };
  if (ageDays <= 27) return { available: true as const, dose: range(3, 12), frequency: "每48小时1次", note: "3–12 mg/kg/次；最大每48小时12 mg/kg" };
  if (ageDays < 12 * 365.25) return { available: true as const, dose: range(3, 12), frequency: "每日1次", note: "3–12 mg/kg/次；最大400 mg" };
  if (ageDays < 18 * 365.25) return { available: true as const, dose: range(8, 12), frequency: "每日1次", note: "8–12 mg/kg/次；最大400 mg" };
  return { available: false as const, reason: "本项目资料仅提供至17岁的剂量参考。" };
}

export function calculateItraconazole(ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 24) return { available: false as const, reason: "2岁以下未批准用于此类患者，暂无剂量参考。" };
  if (weightKg <= 0) return { available: false as const, reason: "请输入有效体重后计算。" };
  return { available: true as const, totalDaily: rounded(weightKg * 5), perDose: rounded(weightKg * 2.5), frequency: "每日2次" };
}

export function getStandardDoseLines(drug: DrugName, ageMonths: number, ageDays: number, weightKg: number, heightCm: number): string[] {
  if (drug === "米卡芬净") {
    const r = calculateMicafungin(weightKg);
    return r ? [`每日1次，每次${r.daily} mg（1 mg/kg，最大50 mg）`, `或每周2次，每次${r.twiceWeekly} mg（4 mg/kg）`] : ["请输入有效体重后计算。"];
  }
  if (drug === "泊沙康唑") {
    const tablet = calculatePosaconazole("tablet", ageMonths, weightKg);
    const suspension = calculatePosaconazole("suspension", ageMonths, weightKg);
    const tabletLine = tablet && tablet.available ? `肠溶片：${tablet.loading}；${tablet.maintenance}` : `肠溶片：${tablet && "reason" in tablet ? tablet.reason : "暂无剂量参考"}`;
    const suspensionLine = suspension && suspension.available ? `口服混悬液：每次${suspension.dose} mg，${suspension.frequency}（${suspension.note}）` : `口服混悬液：${suspension && "reason" in suspension ? suspension.reason : "暂无剂量参考"}`;
    return [tabletLine, suspensionLine];
  }
  if (drug === "伏立康唑") {
    const r = calculateVoriconazole(ageMonths, weightKg);
    if (!r || !r.available) return [r?.reason ?? "暂无剂量参考。"];
    return r.regimen === "pediatric" ? [`每次${r.dose} mg，${r.frequency}（${r.note}）`] : [r.loading, r.maintenance];
  }
  if (drug === "氟康唑") {
    const r = calculateFluconazole(ageDays, weightKg);
    return r && r.available ? [`${r.dose}，${r.frequency}（${r.note}）`] : [r?.reason ?? "暂无剂量参考。"];
  }
  if (drug === "伊曲康唑") {
    const r = calculateItraconazole(ageMonths, weightKg);
    return r.available ? [`每日总量${r.totalDaily} mg，分2次给药（每次${r.perDose} mg）`] : [r.reason];
  }
  if (drug === "艾沙康唑") return ["前48小时内，每8小时一瓶（相当于200 mg艾沙康唑），共给药6次。", "从末次负荷剂量给药后12至24小时开始，每日1次，每次一瓶（相当于200 mg艾沙康唑）。", "尚未确定18岁以下未成年人使用本品的安全性及疗效，属于超说明书用药。"];
  if (drug === "脂质体两性霉素B") return ["每周3次，每次1 mg/kg；或每周3次，每次3 mg/kg；或每周2次，每次2.5 mg/kg。"];
  const r = calculateCaspofungin(weightKg, heightCm);
  return r ? [`首日负荷${r.loading} mg（70 mg/m²，最大70 mg）`, `维持${r.maintenance} mg，每日1次（50 mg/m²，最大70 mg）`] : ["请输入有效体重和身高后计算。"];
}

export function getDoseAdjustments(drug: DrugName, organ: OrganMedicationInputs, weightKg: number, heightCm: number): string[] {
  const result: string[] = [];
  const renalAffected = organ.renalStatus !== "" && organ.renalStatus !== "normal";
  const hepaticAffected = organ.hepaticStatus !== "" && organ.hepaticStatus !== "normal";
  if (drug === "泊沙康唑") {
    if (renalAffected) result.push("肾功能不全对泊沙康唑药代动力学不存在显著影响，无需调整剂量。");
    if (hepaticAffected) result.push("肝功能不全：资料不建议进行剂量调整。");
  }
  if (drug === "米卡芬净") {
    if (renalAffected) result.push("肾功能损害患者不需要调整剂量。");
    if (hepaticAffected) result.push("肝功能异常可能加重，应定期检查肝功能；出现异常时采取适当处理，如停止给药。");
  }
  if (drug === "卡泊芬净") {
    if (renalAffected) result.push(organ.renalStatus === "dialysis" ? "卡泊芬净不可透析，血液透析后不需要补充剂量。" : "肾功能损害患者不需要调整剂量。");
    if (hepaticAffected) result.push("目前没有肝功能不同程度受损儿童患者的临床用药经验。");
    if (organ.medications.includes("rifabutin") || organ.medications.includes("enzyme-inducer")) {
      const bsa = bodySurfaceArea(weightKg, heightCm);
      result.push(Number.isFinite(bsa) ? `合并肝药酶诱导剂：调整为每日${Math.min(rounded(bsa * 70), 70)} mg（70 mg/m²，实际日剂量不超过70 mg）。` : "合并肝药酶诱导剂：应考虑70 mg/m²每日1次，实际日剂量不超过70 mg；输入身高体重后计算。");
    }
  }
  if (drug === "伏立康唑") {
    if (renalAffected) result.push("肾功能损害时宜选口服给药；若静脉给药利大于弊，必须密切监测血清肌酐，异常增高时考虑改为口服。");
    if (organ.medications.includes("phenytoin")) result.push(weightKg >= 40 ? "合并苯妥英：资料建议口服维持剂量调整为每次400 mg，每日2次。" : "合并苯妥英：资料建议口服维持剂量调整为每次200 mg，每日2次。");
    if (organ.medications.includes("rifabutin")) result.push(weightKg >= 40 ? "合并利福布汀：应避免；如必须合用，资料建议口服维持剂量调整为每次350 mg，每日2次。" : "合并利福布汀：应避免；如必须合用，资料建议口服维持剂量调整为每次200 mg，每日2次。");
  }
  if (drug === "艾沙康唑") {
    if (organ.hepaticStatus === "child-ab") result.push("轻度至中度肝功能损害（Child-Pugh A/B级）不需要调整剂量。");
    if (organ.hepaticStatus === "child-c") result.push("重度肝功能损害（Child-Pugh C级）尚未研究；除非潜在获益大于风险，否则不建议使用。");
    if (organ.hepaticStatus === "abnormal") result.push("肝功能异常分级不详：资料仅明确Child-Pugh A/B无需调整、Child-Pugh C通常不建议使用，请补充分级。");
  }
  if (drug === "伊曲康唑" && renalAffected) result.push("肾脏损害患者资料有限，部分患者暴露量可能较低；应谨慎使用并考虑调整剂量。");
  if (drug === "脂质体两性霉素B") {
    if (renalAffected) result.push("肾功能损害患者无需调整剂量或给药频率。");
    if (hepaticAffected) result.push("尚无为肝功能损害患者提供给药建议的数据。");
  }
  return result;
}

