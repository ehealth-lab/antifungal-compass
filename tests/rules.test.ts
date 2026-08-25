import assert from "node:assert/strict";
import test from "node:test";
import {
  ageToDays,
  calculateCaspofungin,
  calculateFluconazole,
  calculateItraconazole,
  calculateMicafungin,
  calculatePosaconazole,
  calculateVoriconazole,
  deriveDiseaseRiskLabel,
  deriveRiskInputs,
  evaluatePrevention,
  getDoseAdjustments,
  initialQuestionnaire,
  selectDrugCandidates,
} from "../app/rules.ts";

test("micafungin calculates both confirmed schedules", () => {
  assert.deepEqual(calculateMicafungin(25), { daily: 25, twiceWeekly: 100 });
  assert.deepEqual(calculateMicafungin(80), { daily: 50, twiceWeekly: 320 });
  assert.equal(calculateMicafungin(0), null);
});

test("posaconazole delayed-release tablet uses the age-13 boundary", () => {
  assert.deepEqual(calculatePosaconazole("tablet", 13 * 12, 40), {
    available: true,
    loading: "首日每次300 mg，每日2次",
    maintenance: "此后每次300 mg，每日1次",
  });
  assert.equal(calculatePosaconazole("tablet", 13 * 12 - 1, 40)?.available, false);
});

test("posaconazole suspension calculates the pediatric weight-based dose", () => {
  assert.deepEqual(calculatePosaconazole("suspension", 12 * 12, 25), {
    available: true,
    dose: 150,
    frequency: "每日3次",
    note: "6 mg/kg/次；资料未提供单次最大剂量及取整规则",
  });
  assert.equal(calculatePosaconazole("suspension", 0, 4)?.available, false);
});

test("caspofungin applies the BSA calculation and dose caps", () => {
  assert.deepEqual(calculateCaspofungin(25, 129.6), {
    bsa: 0.9,
    loading: 66.4,
    maintenance: 47.4,
  });
  assert.deepEqual(calculateCaspofungin(80, 180), {
    bsa: 2,
    loading: 70,
    maintenance: 70,
  });
});

test("QTc prolongation adds isavuconazole without removing baseline candidates", () => {
  const baseline = selectDrugCandidates({
    preventionLevel: "recommended",
    patientAgeMonths: 8 * 12,
    imagingOrMarkerPositive: false,
    amlInduction: true,
    hsct: false,
    prolongedNeutropenia: false,
    qtcProlonged: false,
    azoleContraindicatedOrPoorAbsorption: false,
  });
  const withQtc = selectDrugCandidates({
    preventionLevel: "recommended",
    patientAgeMonths: 8 * 12,
    imagingOrMarkerPositive: false,
    amlInduction: true,
    hsct: false,
    prolongedNeutropenia: false,
    qtcProlonged: true,
    azoleContraindicatedOrPoorAbsorption: false,
  });

  assert.deepEqual(baseline.map((drug) => drug.name), ["泊沙康唑"]);
  assert.deepEqual(withQtc.map((drug) => drug.name), ["泊沙康唑", "艾沙康唑"]);
  assert.equal(withQtc[1]?.offLabel, true);
});

test("long-term neutropenia can also add off-label isavuconazole", () => {
  const candidates = selectDrugCandidates({
    preventionLevel: "consider",
    patientAgeMonths: 8 * 12,
    imagingOrMarkerPositive: false,
    amlInduction: false,
    hsct: false,
    prolongedNeutropenia: true,
    qtcProlonged: false,
    azoleContraindicatedOrPoorAbsorption: false,
  });
  const isavuconazole = candidates.find((drug) => drug.name === "艾沙康唑");
  assert.equal(isavuconazole?.rank, "可考虑");
  assert.equal(isavuconazole?.offLabel, true);
});

test("isavuconazole is not labeled off-label at age 18 or above", () => {
  const candidates = selectDrugCandidates({
    preventionLevel: "recommended",
    patientAgeMonths: 18 * 12,
    imagingOrMarkerPositive: false,
    amlInduction: true,
    hsct: false,
    prolongedNeutropenia: false,
    qtcProlonged: true,
    azoleContraindicatedOrPoorAbsorption: false,
  });
  assert.equal(candidates.find((drug) => drug.name === "艾沙康唑")?.offLabel, false);
});

test("detailed questionnaire maps ALL high-risk and treatment-stage rules", () => {
  const questionnaire = {
    ...initialQuestionnaire,
    diagnosis: "ALL" as const,
    allSubtype: "T-ALL" as const,
    diseaseRisk: "low" as const,
    treatmentStage: "consolidation" as const,
  };
  const mapped = deriveRiskInputs(questionnaire, 8 * 12, {
    currentIfd: false,
    imagingOrMarkerPositive: false,
    previousIfd: false,
  });
  assert.equal(mapped.leukemia, true);
  assert.equal(mapped.highRiskAll, true);
  assert.equal(mapped.consolidationOrIntensification, true);
  assert.equal(deriveDiseaseRiskLabel(questionnaire, 8 * 12).label, "高危");
});

test("infant age alone maps ALL to the confirmed high-risk branch", () => {
  const questionnaire = { ...initialQuestionnaire, diagnosis: "ALL" as const };
  assert.equal(deriveRiskInputs(questionnaire, 11, {
    currentIfd: false,
    imagingOrMarkerPositive: false,
    previousIfd: false,
  }).highRiskAll, true);
});

test("immune therapy subtypes map ATG and systemic therapy", () => {
  const questionnaire = {
    ...initialQuestionnaire,
    immuneTherapies: ["atg", "small-molecule"] as const,
  };
  const mapped = deriveRiskInputs({ ...questionnaire, immuneTherapies: [...questionnaire.immuneTherapies] }, 120, {
    currentIfd: false,
    imagingOrMarkerPositive: false,
    previousIfd: false,
  });
  assert.equal(mapped.atg, true);
  assert.equal(mapped.systemicImmuneTherapy, true);
});

test("systemic immune or lymphocyte-targeted therapy is a recommended prevention indication", () => {
  const result = evaluatePrevention({
    currentIfd: false,
    imagingOrMarkerPositive: false,
    previousIfd: false,
    hsct: false,
    preEngraftment: false,
    alloHsctWithGvhdOrTherapy: false,
    systemicImmuneTherapy: true,
    atg: false,
    leukemia: false,
    aml: false,
    amlHighRisk: false,
    highRiskAll: false,
    consolidationOrIntensification: false,
    inductionRefractoryRelapse: false,
    hodgkinLymphoma: false,
    generalRiskFactor: false,
  });

  assert.equal(result.level, "recommended");
  assert.equal(result.riskBand, "高危");
  assert.equal(result.title, "推荐进行抗真菌预防");
});

test("voriconazole calculates pediatric dose and applies age approval boundary", () => {
  assert.deepEqual(calculateVoriconazole(8 * 12, 25), {
    available: true,
    regimen: "pediatric",
    dose: 225,
    frequency: "每日2次",
    note: "9 mg/kg/次，最大单次剂量350 mg",
  });
  assert.equal(calculateVoriconazole(23, 12)?.available, false);
  assert.equal(calculateVoriconazole(14 * 12, 50)?.regimen, "adolescent");
});

test("fluconazole uses neonatal day boundaries", () => {
  assert.deepEqual(calculateFluconazole(14, 3), {
    available: true,
    dose: "9–36 mg/次",
    frequency: "每72小时1次",
    note: "3–12 mg/kg/次；最大每72小时12 mg/kg",
  });
  assert.equal(calculateFluconazole(15, 3)?.frequency, "每48小时1次");
  assert.equal(ageToDays(1, "months") > 27, true);
});

test("itraconazole calculates total and divided doses from age two", () => {
  assert.deepEqual(calculateItraconazole(24, 20), {
    available: true,
    totalDaily: 100,
    perDose: 50,
    frequency: "每日2次",
  });
  assert.equal(calculateItraconazole(23, 20).available, false);
});

test("posaconazole organ adjustments preserve standard dose and add source text", () => {
  const adjustments = getDoseAdjustments("泊沙康唑", {
    renalStatus: "impaired",
    hepaticStatus: "child-ab",
    medications: ["tacrolimus"],
  }, 25, 125);
  assert.deepEqual(adjustments, [
    "肾功能不全对泊沙康唑药代动力学不存在显著影响，无需调整剂量。",
    "肝功能不全：资料不建议进行剂量调整。",
  ]);
});

