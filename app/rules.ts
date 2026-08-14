export type AgeUnit = "years" | "months";

export type RiskLevel =
  | "secondary"
  | "recommended"
  | "consider"
  | "monitor"
  | "not-routine";

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
  title: string;
  detail: string;
  trace: string[];
};

export type DrugCandidate = {
  name: string;
  rank: "首选" | "推荐" | "可考虑" | "条件使用" | "不推荐";
  note?: string;
  offLabel?: boolean;
};

export function ageToMonths(value: number, unit: AgeUnit): number {
  if (!Number.isFinite(value) || value < 0) return Number.NaN;
  return unit === "years" ? value * 12 : value;
}

export function bodySurfaceArea(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return Number.NaN;
  return Math.sqrt((weightKg * heightCm) / 3600);
}

export function evaluatePrevention(input: RiskInputs): RiskResult {
  const ifdSignals: string[] = [];
  if (input.currentIfd) ifdSignals.push("当前确诊或疑似IFD");
  if (input.imagingOrMarkerPositive) ifdSignals.push("影像学改变或G/GM试验阳性");
  if (input.previousIfd) ifdSignals.push("既往IFD史");

  if (ifdSignals.length > 0) {
    return {
      level: "secondary",
      title: "推荐进行二级预防",
      detail:
        "本结果严格复现资料提供者确认的原始流程；当前活动性或疑似感染仍需由临床团队另行判断诊疗路径。",
      trace: ifdSignals,
    };
  }

  if (input.hsct) {
    if (input.preEngraftment) {
      return {
        level: "recommended",
        title: "推荐进行抗真菌预防",
        detail: "预防与移植前预处理同时开始，原始流程建议至少持续至移植后3个月。",
        trace: ["正在进行造血干细胞移植", "处于植入前阶段"],
      };
    }
    if (input.alloHsctWithGvhdOrTherapy) {
      return {
        level: "recommended",
        title: "推荐进行抗真菌预防",
        detail: "异基因HSCT并合并GVHD或正在接受免疫/靶向治疗。",
        trace: ["造血干细胞移植", "异基因HSCT合并GVHD或免疫/靶向治疗"],
      };
    }
    return input.generalRiskFactor
      ? {
          level: "consider",
          title: "可考虑进行预防",
          detail: "存在资料列出的至少一项附加危险因素。",
          trace: ["造血干细胞移植", "合并附加危险因素"],
        }
      : {
          level: "not-routine",
          title: "不推荐常规预防",
          detail: "未命中原始流程中的移植后高危条件。",
          trace: ["造血干细胞移植", "未合并所列高危条件"],
        };
  }

  if (input.systemicImmuneTherapy) {
    if (input.atg) {
      return {
        level: "recommended",
        title: "推荐进行抗真菌预防",
        detail: "正在接受ATG。",
        trace: ["全身免疫治疗或淋巴细胞靶向治疗", "接受ATG"],
      };
    }
    return input.generalRiskFactor
      ? {
          level: "consider",
          title: "可考虑进行预防",
          detail: "接受免疫/靶向治疗并合并附加危险因素。",
          trace: ["免疫或靶向治疗", "合并附加危险因素"],
        }
      : {
          level: "monitor",
          title: "建议密切监测",
          detail: "接受免疫/靶向治疗，但未命中原始流程中的附加危险因素。",
          trace: ["免疫或靶向治疗", "未合并所列附加危险因素"],
        };
  }

  if (input.leukemia) {
    if (input.aml) {
      if (input.amlHighRisk) {
        return {
          level: "recommended",
          title: "推荐进行抗真菌预防",
          detail: "预防需覆盖预期的严重中性粒细胞减少期。",
          trace: ["白血病", "AML", "高危"],
        };
      }
      return input.generalRiskFactor
        ? {
            level: "recommended",
            title: "推荐进行抗真菌预防",
            detail: "AML并合并资料列出的附加危险因素。",
            trace: ["白血病", "AML", "合并附加危险因素"],
          }
        : {
            level: "consider",
            title: "个体化评估后可考虑预防",
            detail: "需结合化疗强度、黏膜炎风险等因素进行个体化评估。",
            trace: ["白血病", "AML", "未命中明确高危条件"],
          };
    }

    if (input.highRiskAll) {
      return {
        level: "recommended",
        title: "推荐进行抗真菌预防",
        detail: input.consolidationOrIntensification
          ? "当前处于巩固/强化化疗阶段，为预防重点覆盖期。"
          : "命中高危/T细胞/婴儿/费城染色体阳性ALL条件。",
        trace: [
          "白血病",
          "高危/T细胞/婴儿/费城染色体阳性ALL",
          input.consolidationOrIntensification ? "巩固/强化化疗" : "其他治疗阶段",
        ],
      };
    }

    if (input.inductionRefractoryRelapse) {
      return {
        level: "recommended",
        title: "推荐进行抗真菌预防",
        detail: "预防需结合既往治疗史、免疫抑制状态综合评估。",
        trace: ["白血病", "诱导/难治/复发治疗阶段"],
      };
    }

    return input.generalRiskFactor
      ? {
          level: "consider",
          title: "可考虑进行预防",
          detail: "白血病并合并资料列出的附加危险因素。",
          trace: ["白血病", "合并附加危险因素"],
        }
      : {
          level: "not-routine",
          title: "不推荐常规预防",
          detail: "未命中原始流程中的明确预防条件。",
          trace: ["白血病", "未命中明确高危条件"],
        };
  }

  if (input.hodgkinLymphoma && input.generalRiskFactor) {
    return {
      level: "consider",
      title: "可考虑进行预防",
      detail: "霍奇金淋巴瘤并合并资料列出的附加危险因素。",
      trace: ["霍奇金淋巴瘤", "合并附加危险因素"],
    };
  }

  return {
    level: "not-routine",
    title: "不推荐常规预防",
    detail: "未命中原始流程中的明确预防条件。",
    trace: ["未命中白血病、移植、免疫治疗等明确路径"],
  };
}

export function selectDrugCandidates(options: {
  preventionLevel: RiskLevel;
  patientAgeMonths: number;
  imagingOrMarkerPositive: boolean;
  amlInduction: boolean;
  hsct: boolean;
  prolongedNeutropenia: boolean;
  qtcProlonged: boolean;
  azoleContraindicatedOrPoorAbsorption: boolean;
}): DrugCandidate[] {
  if (options.preventionLevel === "not-routine" || options.preventionLevel === "monitor") {
    return [];
  }

  if (options.imagingOrMarkerPositive) {
    return [{ name: "伏立康唑", rank: "首选", note: "按原始药物选择流程输出" }];
  }

  const drugs: DrugCandidate[] = [];
  if (options.amlInduction) {
    drugs.push({ name: "泊沙康唑", rank: "推荐" });
  } else if (options.hsct || options.prolongedNeutropenia) {
    drugs.push(
      { name: "泊沙康唑", rank: "推荐" },
      { name: "伏立康唑", rank: "推荐" },
    );
    if (options.azoleContraindicatedOrPoorAbsorption) {
      drugs.push({
        name: "米卡芬净",
        rank: "条件使用",
        note: "唑类禁忌或胃肠道吸收不良",
      });
    }
  } else {
    drugs.push({ name: "氟康唑", rank: "可考虑" });
  }

  if (options.qtcProlonged || options.prolongedNeutropenia) {
    drugs.push({
      name: "艾沙康唑",
      rank: "可考虑",
      note: options.qtcProlonged ? "QTc间期延长" : "长期中性粒细胞减少",
      offLabel: Number.isFinite(options.patientAgeMonths) && options.patientAgeMonths < 18 * 12,
    });
  }

  const seen = new Set<string>();
  return drugs.filter((drug) => {
    if (seen.has(drug.name)) return false;
    seen.add(drug.name);
    return true;
  });
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateMicafungin(weightKg: number) {
  if (weightKg <= 0) return null;
  return {
    daily: Math.min(rounded(weightKg), 50),
    twiceWeekly: rounded(weightKg * 4),
  };
}

export function calculatePosaconazole(
  formulation: "tablet" | "suspension",
  ageMonths: number,
  weightKg: number,
) {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;
  if (formulation === "tablet") {
    return ageMonths >= 13 * 12
      ? {
          available: true as const,
          loading: "首日每次300 mg，每日2次",
          maintenance: "此后每次300 mg，每日1次",
        }
      : {
          available: false as const,
          reason: "13岁以下未批准使用，且现有指南未进行剂量推荐。",
        };
  }

  if (ageMonths < 1) {
    return { available: false as const, reason: "小于1个月暂无计算规则。" };
  }
  if (ageMonths >= 13 * 12) {
    return {
      available: true as const,
      dose: 200,
      frequency: "每日3次",
      note: "固定剂量",
    };
  }
  if (weightKg <= 0) {
    return { available: false as const, reason: "请输入有效体重后计算。" };
  }
  return {
    available: true as const,
    dose: rounded(weightKg * 6),
    frequency: "每日3次",
    note: "6 mg/kg/次；资料未提供单次最大剂量及取整规则",
  };
}

export function calculateCaspofungin(weightKg: number, heightCm: number) {
  const bsa = bodySurfaceArea(weightKg, heightCm);
  if (!Number.isFinite(bsa)) return null;
  return {
    bsa: rounded(bsa),
    loading: Math.min(rounded(bsa * 70), 70),
    maintenance: Math.min(rounded(bsa * 50), 70),
  };
}
