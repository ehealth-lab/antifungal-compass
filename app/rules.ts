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
  riskBand: "IFD��ظ�Σ" | "��Σ" | "��Σ" | "�����м��" | "δ���и�Σ����";
  title: string;
  detail: string;
  trace: string[];
};

export type DrugName = "��ɳ����" | "��������" | "�׿��Ҿ�" | "������" | "��ɳ����" | "��������" | "�����Ҿ�" | "֬��������ù��B";
export type DrugCandidate = { name: DrugName; rank: "��ѡ" | "�Ƽ�" | "�ɿ���" | "����ʹ��" | "���Ƽ�"; note?: string; offLabel?: boolean };
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
  if (!questionnaire.diagnosis) return { label: "����д", detail: "��ѡ������Ҫ������ϺͶ�Ӧ������Ϣ��" };
  if (questionnaire.diagnosis === "ALL") {
    const reasons: string[] = [];
    if (questionnaire.diseaseRisk === "high") reasons.push("��������ѡ���Σ");
    if (questionnaire.allSubtype === "T-ALL") reasons.push("T-ALL");
    if (questionnaire.phStatus === "positive") reasons.push("Ph����");
    if (Number.isFinite(ageMonths) && ageMonths < 12) reasons.push("����С��1��");
    if (reasons.length) return { label: "��Σ", detail: reasons.join("��") };
  }
  if (["ALL", "AML", "MDS"].includes(questionnaire.diagnosis)) {
    const labels: Record<DiseaseRisk, string> = { "": "����д", low: "��Σ", intermediate: "��Σ", high: "��Σ" };
    return { label: labels[questionnaire.diseaseRisk], detail: "����������շּ���ʾ��" };
  }
  if (questionnaire.diagnosis === "lymphoma") {
    if (!questionnaire.lymphomaHighRisk) return { label: "����д", detail: "����д�ܰ������ڼ��Ƿ��Σ��" };
    return { label: questionnaire.lymphomaHighRisk === "yes" ? "��Σ" : "�Ǹ�Σ", detail: questionnaire.lymphomaStage ? `�������ڣ�${questionnaire.lymphomaStage}��` : "����������δ��д��" };
  }
  if (questionnaire.diagnosis === "CML") {
    const labels = { "": "����д", chronic: "������", accelerated: "������", blast: "������", other: "����/����" };
    return { label: labels[questionnaire.cmlPhase], detail: "������CML�����׶���ʾ��" };
  }
  return { label: "δ�ּ�", detail: "��ǰ���û�����ü������շּ�����" };
}

export function evaluatePrevention(input: RiskInputs): RiskResult {
  const ifdSignals: string[] = [];
  if (input.currentIfd) ifdSignals.push("��ǰȷ�������IFD");
  if (input.imagingOrMarkerPositive) ifdSignals.push("Ӱ��ѧ�ı��G/GM��������");
  if (input.previousIfd) ifdSignals.push("����IFDʷ");
  if (ifdSignals.length > 0) return { level: "secondary", riskBand: "IFD��ظ�Σ", title: "�Ƽ����ж���Ԥ��", detail: "������������ṩ��ȷ�ϵ�ԭʼ�����������ǰ��Ի����Ƹ�Ⱦ�������ٴ��Ŷ������ж�����·����", trace: ifdSignals };
  if (input.hsct) {
    if (input.preEngraftment) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "Ԥ������ֲǰԤ����ͬʱ��ʼ��ԭʼ���̽������ٳ�������ֲ��3���¡�", trace: ["���ڽ�����Ѫ��ϸ����ֲ", "����ֲ��ǰ�׶�"] };
    if (input.alloHsctWithGvhdOrTherapy) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "�����HSCT���ϲ�GVHD�����ڽ�������/�������ơ�", trace: ["�������Ѫ��ϸ����ֲ", "�ϲ�GVHD������/��������"] };
    return input.generalRiskFactor
      ? { level: "consider", riskBand: "��Σ", title: "�ɿ��ǽ���Ԥ��", detail: "���������г�������һ���Σ�����ء�", trace: ["��Ѫ��ϸ����ֲ", "�ϲ�����Σ������"] }
      : { level: "not-routine", riskBand: "δ���и�Σ����", title: "���Ƽ�����Ԥ��", detail: "δ����ԭʼ�����е���ֲ���Σ������", trace: ["��Ѫ��ϸ����ֲ", "δ�ϲ����и�Σ����"] };
  }
  if (input.systemicImmuneTherapy || input.atg) {
    if (input.atg) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "���ڽ���ATG��", trace: ["ȫ���������ƻ��ܰ�ϸ����������", "����ATG"] };
    return input.generalRiskFactor
      ? { level: "consider", riskBand: "��Σ", title: "�ɿ��ǽ���Ԥ��", detail: "��������/�������Ʋ��ϲ�����Σ�����ء�", trace: ["���߻��������", "�ϲ�����Σ������"] }
      : { level: "monitor", riskBand: "�����м��", title: "�������м��", detail: "��������/�������ƣ���δ����ԭʼ�����еĸ���Σ�����ء�", trace: ["���߻��������", "δ�ϲ����и���Σ������"] };
  }
  if (input.leukemia) {
    if (input.aml) {
      if (input.amlHighRisk) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "Ԥ���踲��Ԥ�ڵ�����������ϸ�������ڡ�", trace: ["��Ѫ��", "AML", "��Σ"] };
      return input.generalRiskFactor
        ? { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "AML���ϲ������г��ĸ���Σ�����ء�", trace: ["��Ѫ��", "AML", "�ϲ�����Σ������"] }
        : { level: "consider", riskBand: "��Σ", title: "���廯������ɿ���Ԥ��", detail: "���ϻ���ǿ�ȡ��Ĥ�׷��յ����ؽ��и��廯������", trace: ["��Ѫ��", "AML", "δ������ȷ��Σ����"] };
    }
    if (input.highRiskAll) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: input.consolidationOrIntensification ? "��ǰ���ڹ���/ǿ�����ƽ׶Σ�ΪԤ���ص㸲���ڡ�" : "���и�Σ/Tϸ��/Ӥ��/�ѳ�Ⱦɫ������ALL������", trace: ["��Ѫ��", "��Σ/Tϸ��/Ӥ��/�ѳ�Ⱦɫ������ALL", input.consolidationOrIntensification ? "����/ǿ������" : "�������ƽ׶�"] };
    if (input.inductionRefractoryRelapse) return { level: "recommended", riskBand: "��Σ", title: "�Ƽ����п����Ԥ��", detail: "Ԥ�����ϼ�������ʷ����������״̬�ۺ�������", trace: ["��Ѫ��", "�յ�/����/�������ƽ׶�"] };
    return input.generalRiskFactor
      ? { level: "consider", riskBand: "��Σ", title: "�ɿ��ǽ���Ԥ��", detail: "��Ѫ�����ϲ������г��ĸ���Σ�����ء�", trace: ["��Ѫ��", "�ϲ�����Σ������"] }
      : { level: "not-routine", riskBand: "δ���и�Σ����", title: "���Ƽ�����Ԥ��", detail: "δ����ԭʼ�����е���ȷԤ��������", trace: ["��Ѫ��", "δ������ȷ��Σ����"] };
  }
  if (input.hodgkinLymphoma && input.generalRiskFactor) return { level: "consider", riskBand: "��Σ", title: "�ɿ��ǽ���Ԥ��", detail: "������ܰ������ϲ������г��ĸ���Σ�����ء�", trace: ["������ܰ���", "�ϲ�����Σ������"] };
  return { level: "not-routine", riskBand: "δ���и�Σ����", title: "���Ƽ�����Ԥ��", detail: "δ����ԭʼ�����е���ȷԤ��������", trace: ["δ���а�Ѫ������ֲ���������Ƶ���ȷ·��"] };
}

export function selectDrugCandidates(options: { preventionLevel: RiskLevel; patientAgeMonths: number; imagingOrMarkerPositive: boolean; amlInduction: boolean; hsct: boolean; prolongedNeutropenia: boolean; qtcProlonged: boolean; azoleContraindicatedOrPoorAbsorption: boolean }): DrugCandidate[] {
  if (options.preventionLevel === "not-routine" || options.preventionLevel === "monitor") return [];
  if (options.imagingOrMarkerPositive) return [{ name: "��������", rank: "��ѡ", note: "��ԭʼҩ��ѡ���������" }];
  const drugs: DrugCandidate[] = [];
  if (options.amlInduction) drugs.push({ name: "��ɳ����", rank: "�Ƽ�" });
  else if (options.hsct || options.prolongedNeutropenia) {
    drugs.push({ name: "��ɳ����", rank: "�Ƽ�" }, { name: "��������", rank: "�Ƽ�" });
    if (options.azoleContraindicatedOrPoorAbsorption) drugs.push({ name: "�׿��Ҿ�", rank: "����ʹ��", note: "������ɻ�θ�������ղ���" });
  } else drugs.push({ name: "������", rank: "�ɿ���" });
  if (options.qtcProlonged || options.prolongedNeutropenia) drugs.push({ name: "��ɳ����", rank: "�ɿ���", note: options.qtcProlonged ? "QTc�����ӳ�" : "����������ϸ������", offLabel: Number.isFinite(options.patientAgeMonths) && options.patientAgeMonths < 18 * 12 });
  const seen = new Set<string>();
  return drugs.filter((drug) => seen.has(drug.name) ? false : (seen.add(drug.name), true));
}

function rounded(value: number): number { return Math.round(value * 10) / 10; }
export function calculateMicafungin(weightKg: number) { return weightKg > 0 ? { daily: Math.min(rounded(weightKg), 50), twiceWeekly: rounded(weightKg * 4) } : null; }

export function calculatePosaconazole(formulation: "tablet" | "suspension", ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;
  if (formulation === "tablet") return ageMonths >= 13 * 12
    ? { available: true as const, loading: "����ÿ��300 mg��ÿ��2��", maintenance: "�˺�ÿ��300 mg��ÿ��1��" }
    : { available: false as const, reason: "13������δ��׼���ڴ��໼�ߣ���ָ��δ���м����Ƽ���" };
  if (ageMonths < 1) return { available: false as const, reason: "С��1����δ��׼���ڴ��໼�ߣ����޼����ο���" };
  if (ageMonths >= 13 * 12) return { available: true as const, dose: 200, frequency: "ÿ��3��", note: "�̶�����" };
  if (weightKg <= 0) return { available: false as const, reason: "��������Ч���غ���㡣" };
  return { available: true as const, dose: rounded(weightKg * 6), frequency: "ÿ��3��", note: "6 mg/kg/�Σ�����δ�ṩ������������ȡ������" };
}

export function calculateCaspofungin(weightKg: number, heightCm: number) {
  const bsa = bodySurfaceArea(weightKg, heightCm);
  return Number.isFinite(bsa) ? { bsa: rounded(bsa), loading: Math.min(rounded(bsa * 70), 70), maintenance: Math.min(rounded(bsa * 50), 70) } : null;
}

export function calculateVoriconazole(ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;
  if (ageMonths < 24) return { available: false as const, reason: "2������δ��׼���ڴ��໼�ߣ����޼����ο���" };
  const pediatric = ageMonths < 12 * 12 || (ageMonths < 15 * 12 && weightKg < 50);
  if (pediatric) {
    if (weightKg <= 0) return { available: false as const, reason: "��������Ч���غ���㡣" };
    return { available: true as const, regimen: "pediatric" as const, dose: Math.min(rounded(weightKg * 9), 350), frequency: "ÿ��2��", note: "9 mg/kg/�Σ���󵥴μ���350 mg" };
  }
  return { available: true as const, regimen: "adolescent" as const, loading: "����ÿ��400 mg��ÿ��2��", maintenance: "�˺�ÿ��200 mg��ÿ��2��" };
}

export function calculateFluconazole(ageDays: number, weightKg: number) {
  if (!Number.isFinite(ageDays) || ageDays < 0) return null;
  if (weightKg <= 0) return { available: false as const, reason: "��������Ч���غ���㡣" };
  const range = (low: number, high: number) => `${rounded(weightKg * low)}�C${Math.min(rounded(weightKg * high), 400)} mg/��`;
  if (ageDays <= 14) return { available: true as const, dose: range(3, 12), frequency: "ÿ72Сʱ1��", note: "3�C12 mg/kg/�Σ����ÿ72Сʱ12 mg/kg" };
  if (ageDays <= 27) return { available: true as const, dose: range(3, 12), frequency: "ÿ48Сʱ1��", note: "3�C12 mg/kg/�Σ����ÿ48Сʱ12 mg/kg" };
  if (ageDays < 12 * 365.25) return { available: true as const, dose: range(3, 12), frequency: "ÿ��1��", note: "3�C12 mg/kg/�Σ����400 mg" };
  if (ageDays < 18 * 365.25) return { available: true as const, dose: range(8, 12), frequency: "ÿ��1��", note: "8�C12 mg/kg/�Σ����400 mg" };
  return { available: false as const, reason: "����Ŀ���Ͻ��ṩ��17��ļ����ο���" };
}

export function calculateItraconazole(ageMonths: number, weightKg: number) {
  if (!Number.isFinite(ageMonths) || ageMonths < 24) return { available: false as const, reason: "2������δ��׼���ڴ��໼�ߣ����޼����ο���" };
  if (weightKg <= 0) return { available: false as const, reason: "��������Ч���غ���㡣" };
  return { available: true as const, totalDaily: rounded(weightKg * 5), perDose: rounded(weightKg * 2.5), frequency: "ÿ��2��" };
}

export function getStandardDoseLines(drug: DrugName, ageMonths: number, ageDays: number, weightKg: number, heightCm: number): string[] {
  if (drug === "�׿��Ҿ�") {
    const r = calculateMicafungin(weightKg);
    return r ? [`ÿ��1�Σ�ÿ��${r.daily} mg��1 mg/kg�����50 mg��`, `��ÿ��2�Σ�ÿ��${r.twiceWeekly} mg��4 mg/kg��`] : ["��������Ч���غ���㡣"];
  }
  if (drug === "��ɳ����") {
    const tablet = calculatePosaconazole("tablet", ageMonths, weightKg);
    const suspension = calculatePosaconazole("suspension", ageMonths, weightKg);
    const tabletLine = tablet && tablet.available ? `����Ƭ��${tablet.loading}��${tablet.maintenance}` : `����Ƭ��${tablet && "reason" in tablet ? tablet.reason : "���޼����ο�"}`;
    const suspensionLine = suspension && suspension.available ? `�ڷ�����Һ��ÿ��${suspension.dose} mg��${suspension.frequency}��${suspension.note}��` : `�ڷ�����Һ��${suspension && "reason" in suspension ? suspension.reason : "���޼����ο�"}`;
    return [tabletLine, suspensionLine];
  }
  if (drug === "��������") {
    const r = calculateVoriconazole(ageMonths, weightKg);
    if (!r || !r.available) return [r?.reason ?? "���޼����ο���"];
    return r.regimen === "pediatric" ? [`ÿ��${r.dose} mg��${r.frequency}��${r.note}��`] : [r.loading, r.maintenance];
  }
  if (drug === "������") {
    const r = calculateFluconazole(ageDays, weightKg);
    return r && r.available ? [`${r.dose}��${r.frequency}��${r.note}��`] : [r?.reason ?? "���޼����ο���"];
  }
  if (drug === "��������") {
    const r = calculateItraconazole(ageMonths, weightKg);
    return r.available ? [`ÿ������${r.totalDaily} mg����2�θ�ҩ��ÿ��${r.perDose} mg��`] : [r.reason];
  }
  if (drug === "��ɳ����") return ["ǰ48Сʱ�ڣ�ÿ8Сʱһƿ���൱��200 mg��ɳ���򣩣�����ҩ6�Ρ�", "��ĩ�θ��ɼ�����ҩ��12��24Сʱ��ʼ��ÿ��1�Σ�ÿ��һƿ���൱��200 mg��ɳ���򣩡�", "��δȷ��18������δ������ʹ�ñ�Ʒ�İ�ȫ�Լ���Ч�����ڳ�˵������ҩ��"];
  if (drug === "֬��������ù��B") return ["ÿ��3�Σ�ÿ��1 mg/kg����ÿ��3�Σ�ÿ��3 mg/kg����ÿ��2�Σ�ÿ��2.5 mg/kg��"];
  const r = calculateCaspofungin(weightKg, heightCm);
  return r ? [`���ո���${r.loading} mg��70 mg/m2�����70 mg��`, `ά��${r.maintenance} mg��ÿ��1�Σ�50 mg/m2�����70 mg��`] : ["��������Ч���غ����ߺ���㡣"];
}

export function getDoseAdjustments(drug: DrugName, organ: OrganMedicationInputs, weightKg: number, heightCm: number): string[] {
  const result: string[] = [];
  const renalAffected = organ.renalStatus !== "" && organ.renalStatus !== "normal";
  const hepaticAffected = organ.hepaticStatus !== "" && organ.hepaticStatus !== "normal";
  if (drug === "��ɳ����") {
    if (renalAffected) result.push("�����ܲ�ȫ�Բ�ɳ����ҩ������ѧ����������Ӱ�죬�������������");
    if (hepaticAffected) result.push("�ι��ܲ�ȫ�����ϲ�������м���������");
  }
  if (drug === "�׿��Ҿ�") {
    if (renalAffected) result.push("�������𺦻��߲���Ҫ����������");
    if (hepaticAffected) result.push("�ι����쳣���ܼ��أ�Ӧ���ڼ��ι��ܣ������쳣ʱ��ȡ�ʵ���������ֹͣ��ҩ��");
  }
  if (drug === "�����Ҿ�") {
    if (renalAffected) result.push(organ.renalStatus === "dialysis" ? "�����Ҿ�����͸����ѪҺ͸������Ҫ���������" : "�������𺦻��߲���Ҫ����������");
    if (hepaticAffected) result.push("Ŀǰû�иι��ܲ�ͬ�̶������ͯ���ߵ��ٴ���ҩ���顣");
    if (organ.medications.includes("rifabutin") || organ.medications.includes("enzyme-inducer")) {
      const bsa = bodySurfaceArea(weightKg, heightCm);
      result.push(Number.isFinite(bsa) ? `�ϲ���ҩø�յ���������Ϊÿ��${Math.min(rounded(bsa * 70), 70)} mg��70 mg/m2��ʵ���ռ���������70 mg����` : "�ϲ���ҩø�յ�����Ӧ����70 mg/m2ÿ��1�Σ�ʵ���ռ���������70 mg�������������غ���㡣");
    }
  }
  if (drug === "��������") {
    if (renalAffected) result.push("��������ʱ��ѡ�ڷ���ҩ����������ҩ�����ڱף��������м��Ѫ�弡�����쳣����ʱ���Ǹ�Ϊ�ڷ���");
    if (organ.medications.includes("phenytoin")) result.push(weightKg >= 40 ? "�ϲ�����Ӣ�����Ͻ���ڷ�ά�ּ�������Ϊÿ��400 mg��ÿ��2�Ρ�" : "�ϲ�����Ӣ�����Ͻ���ڷ�ά�ּ�������Ϊÿ��200 mg��ÿ��2�Ρ�");
    if (organ.medications.includes("rifabutin")) result.push(weightKg >= 40 ? "�ϲ�������͡��Ӧ���⣻�������ã����Ͻ���ڷ�ά�ּ�������Ϊÿ��350 mg��ÿ��2�Ρ�" : "�ϲ�������͡��Ӧ���⣻�������ã����Ͻ���ڷ�ά�ּ�������Ϊÿ��200 mg��ÿ��2�Ρ�");
  }
  if (drug === "��ɳ����") {
    if (organ.hepaticStatus === "child-ab") result.push("������жȸι����𺦣�Child-Pugh A/B��������Ҫ����������");
    if (organ.hepaticStatus === "child-c") result.push("�ضȸι����𺦣�Child-Pugh C������δ�о�������Ǳ�ڻ�����ڷ��գ����򲻽���ʹ�á�");
    if (organ.hepaticStatus === "abnormal") result.push("�ι����쳣�ּ����꣺���Ͻ���ȷChild-Pugh A/B���������Child-Pugh Cͨ��������ʹ�ã��벹��ּ���");
  }
  if (drug === "��������" && renalAffected) result.push("�����𺦻����������ޣ����ֻ��߱�¶�����ܽϵͣ�Ӧ����ʹ�ò����ǵ���������");
  if (drug === "֬��������ù��B") {
    if (renalAffected) result.push("�������𺦻�����������������ҩƵ�ʡ�");
    if (hepaticAffected) result.push("����Ϊ�ι����𺦻����ṩ��ҩ��������ݡ�");
  }
  return result;
}

