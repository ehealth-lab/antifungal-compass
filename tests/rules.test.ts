import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCaspofungin,
  calculateMicafungin,
  calculatePosaconazole,
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
