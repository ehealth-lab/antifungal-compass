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
    loading: "����ÿ��300 mg��ÿ��2��",
    maintenance: "�˺�ÿ��300 mg��ÿ��1��",
  });
  assert.equal(calculatePosaconazole("tablet", 13 * 12 - 1, 40)?.available, false);
});

test("posaconazole suspension calculates the pediatric weight-based dose", () => {
  assert.deepEqual(calculatePosaconazole("suspension", 12 * 12, 25), {
    available: true,
    dose: 150,
    frequency: "ÿ��3��",
    note: "6 mg/kg/�Σ�����δ�ṩ������������ȡ������",
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

  assert.deepEqual(baseline.map((drug) => drug.name), ["��ɳ����"]);
  assert.deepEqual(withQtc.map((drug) => drug.name), ["��ɳ����", "��ɳ����"]);
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
  const isavuconazole = candidates.find((drug) => drug.name === "��ɳ����");
  assert.equal(isavuconazole?.rank, "�ɿ���");
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
  assert.equal(candidates.find((drug) => drug.name === "��ɳ����")?.offLabel, false);
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
  assert.equal(deriveDiseaseRiskLabel(questionnaire, 8 * 12).label, "��Σ");
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

test("voriconazole calculates pediatric dose and applies age approval boundary", () => {
  assert.deepEqual(calculateVoriconazole(8 * 12, 25), {
    available: true,
    regimen: "pediatric",
    dose: 225,
    frequency: "ÿ��2��",
    note: "9 mg/kg/�Σ���󵥴μ���350 mg",
  });
  assert.equal(calculateVoriconazole(23, 12)?.available, false);
  assert.equal(calculateVoriconazole(14 * 12, 50)?.regimen, "adolescent");
});

test("fluconazole uses neonatal day boundaries", () => {
  assert.deepEqual(calculateFluconazole(14, 3), {
    available: true,
    dose: "9�C36 mg/��",
    frequency: "ÿ72Сʱ1��",
    note: "3�C12 mg/kg/�Σ����ÿ72Сʱ12 mg/kg",
  });
  assert.equal(calculateFluconazole(15, 3)?.frequency, "ÿ48Сʱ1��");
  assert.equal(ageToDays(1, "months") > 27, true);
});

test("itraconazole calculates total and divided doses from age two", () => {
  assert.deepEqual(calculateItraconazole(24, 20), {
    available: true,
    totalDaily: 100,
    perDose: 50,
    frequency: "ÿ��2��",
  });
  assert.equal(calculateItraconazole(23, 20).available, false);
});

test("posaconazole organ adjustments preserve standard dose and add source text", () => {
  const adjustments = getDoseAdjustments("��ɳ����", {
    renalStatus: "impaired",
    hepaticStatus: "child-ab",
    medications: ["tacrolimus"],
  }, 25, 125);
  assert.deepEqual(adjustments, [
    "�����ܲ�ȫ�Բ�ɳ����ҩ������ѧ����������Ӱ�죬�������������",
    "�ι��ܲ�ȫ�����ϲ�������м���������",
  ]);
});

