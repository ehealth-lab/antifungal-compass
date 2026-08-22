"use client";

import { useMemo, useState } from "react";
import {
  additionalRiskFactors,
  calcineurinMtorOptions,
  diagnosisOptions,
  drugReferences,
  getDrugReference,
  getInteractionWarnings,
  immuneTherapyOptions,
  medicationGroups,
  smallMoleculeOptions,
  tdmReference,
} from "./reference-data";
import {
  ageToDays,
  ageToMonths,
  deriveDiseaseRiskLabel,
  deriveRiskInputs,
  evaluatePrevention,
  getDoseAdjustments,
  getStandardDoseLines,
  initialQuestionnaire,
  selectDrugCandidates,
  type AgeUnit,
  type Diagnosis,
  type DrugName,
  type HepaticStatus,
  type MedicationKey,
  type OrganMedicationInputs,
  type QuestionnaireInputs,
  type RenalStatus,
} from "./rules";

const stepTitles = ["��������", "Σ�շּ�", "ҩ��ѡ��", "��������ҩ", "������ο�"];
const initialIfd = { currentIfd: false, imagingOrMarkerPositive: false, previousIfd: false };
const initialOrgan: OrganMedicationInputs = { renalStatus: "", hepaticStatus: "", medications: [] };

function SwitchField({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={`switch-field ${checked ? "is-checked" : ""} ${disabled ? "is-disabled" : ""}`}>
      <span className="switch-copy"><strong>{label}</strong>{hint ? <small>{hint}</small> : null}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true"><span /></span>
    </label>
  );
}

function SelectField({ label, value, placeholder = "��ѡ��", options, onChange }: { label: string; value: string; placeholder?: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(([key, text]) => <option value={key} key={key}>{text}</option>)}
      </select>
    </label>
  );
}

function CheckGrid({ options, selected, onToggle }: { options: readonly (readonly [string, string])[]; selected: string[]; onToggle: (value: string, checked: boolean) => void }) {
  return (
    <div className="check-list">
      {options.map(([value, label]) => {
        const checked = selected.includes(value);
        return (
          <label key={value} className={checked ? "checked" : ""}>
            <input type="checkbox" checked={checked} onChange={(event) => onToggle(value, event.target.checked)} />
            <span className="custom-check">?</span><span>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ResultBadge({ level }: { level: string }) {
  const labels: Record<string, string> = { secondary: "����Ԥ��", recommended: "�Ƽ�Ԥ��", consider: "�ɿ���", monitor: "���м��", "not-routine": "������Ԥ��" };
  return <span className={`result-badge level-${level}`}>{labels[level] ?? level}</span>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [ageValue, setAgeValue] = useState(8);
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("years");
  const [weightKg, setWeightKg] = useState(25);
  const [heightCm, setHeightCm] = useState(125);
  const [ifd, setIfd] = useState(initialIfd);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInputs>(initialQuestionnaire);
  const [organ, setOrgan] = useState<OrganMedicationInputs>(initialOrgan);
  const [copyState, setCopyState] = useState("���ƽ��");

  const ageMonths = ageToMonths(ageValue, ageUnit);
  const ageDays = ageToDays(ageValue, ageUnit);
  const riskInputs = useMemo(() => deriveRiskInputs(questionnaire, ageMonths, ifd), [questionnaire, ageMonths, ifd]);
  const prevention = useMemo(() => evaluatePrevention(riskInputs), [riskInputs]);
  const diseaseRisk = useMemo(() => deriveDiseaseRiskLabel(questionnaire, ageMonths), [questionnaire, ageMonths]);

  const inferredMedicationKeys = useMemo(() => {
    const keys: MedicationKey[] = [];
    if (questionnaire.smallMoleculeTherapies.includes("venetoclax")) keys.push("venetoclax");
    if (questionnaire.smallMoleculeTherapies.includes("bcr-abl")) keys.push("anthracycline-imatinib");
    if (questionnaire.calcineurinMtorTherapies.includes("cyclosporine")) keys.push("cyclosporine");
    if (questionnaire.calcineurinMtorTherapies.includes("tacrolimus")) keys.push("tacrolimus");
    if (questionnaire.calcineurinMtorTherapies.includes("sirolimus")) keys.push("sirolimus");
    if (questionnaire.calcineurinMtorTherapies.includes("everolimus")) keys.push("everolimus");
    return keys;
  }, [questionnaire.smallMoleculeTherapies, questionnaire.calcineurinMtorTherapies]);

  const effectiveMedications = useMemo(() => Array.from(new Set([...organ.medications, ...inferredMedicationKeys])), [organ.medications, inferredMedicationKeys]);
  const effectiveOrgan = useMemo(() => ({ ...organ, medications: effectiveMedications }), [organ, effectiveMedications]);

  const candidates = useMemo(() => selectDrugCandidates({
    preventionLevel: prevention.level,
    patientAgeMonths: ageMonths,
    imagingOrMarkerPositive: ifd.imagingOrMarkerPositive,
    amlInduction: questionnaire.diagnosis === "AML" && questionnaire.treatmentStage === "induction",
    hsct: questionnaire.treatmentStage === "hsct",
    prolongedNeutropenia: questionnaire.neutropeniaOver14Days,
    qtcProlonged: questionnaire.additionalFactors.includes("qtc"),
    azoleContraindicatedOrPoorAbsorption: questionnaire.azoleIssue,
  }), [prevention.level, ageMonths, ifd.imagingOrMarkerPositive, questionnaire]);

  const candidateNames = useMemo(() => new Set(candidates.map((drug) => drug.name)), [candidates]);
  const remainingReferences = useMemo(() => drugReferences.filter((item) => !candidateNames.has(item.drug)), [candidateNames]);

  function updateQuestionnaire<K extends keyof QuestionnaireInputs>(key: K, value: QuestionnaireInputs[K]) {
    setQuestionnaire((current) => ({ ...current, [key]: value }));
  }

  function toggleQuestionnaireList(key: "immuneTherapies" | "smallMoleculeTherapies" | "calcineurinMtorTherapies" | "additionalFactors", value: string, checked: boolean) {
    setQuestionnaire((current) => {
      const list = current[key] as string[];
      return { ...current, [key]: checked ? Array.from(new Set([...list, value])) : list.filter((item) => item !== value) };
    });
  }

  function setDiagnosis(value: string) {
    setQuestionnaire((current) => ({
      ...current,
      diagnosis: value as Diagnosis,
      allSubtype: "", phStatus: "", amlSubtype: "", lymphomaSubtype: "", mdsSubtype: "",
      diseaseRisk: "", lymphomaStage: "", lymphomaHighRisk: "", cmlPhase: "",
    }));
  }

  function resetAll() {
    setStep(0); setAgeValue(8); setAgeUnit("years"); setWeightKg(25); setHeightCm(125);
    setIfd(initialIfd); setQuestionnaire(initialQuestionnaire); setOrgan(initialOrgan);
  }

  async function copySummary() {
    const candidateText = candidates.length ? candidates.map((item) => `${item.name}��${item.rank}${item.offLabel ? "����˵����" : ""}��`).join("��") : "��ǰ·��δ���ɺ�ѡҩ��";
    const text = [
      "�����Ԥ�����߽��",
      `���䣺${ageValue}${ageUnit === "years" ? "��" : ageUnit === "months" ? "����" : "��"}�����أ�${weightKg} kg�����ߣ�${heightCm} cm`,
      `����Σ�շּ���${diseaseRisk.label}��${diseaseRisk.detail}��`,
      `�����Ԥ�����շֲ㣺${prevention.riskBand}`,
      `Ԥ�����ۣ�${prevention.title}`,
      `���ݣ�${prevention.trace.join("��")}`,
      `��ѡҩ�${candidateText}`,
      "��ʾ�����������Ŀ���Ϲ������ɣ�������ٴ���ϡ�������˻���廯���ƾ��ߡ�",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text); setCopyState("�Ѹ���"); window.setTimeout(() => setCopyState("���ƽ��"), 1600);
    } catch { setCopyState("����ʧ��"); }
  }

  function DrugClinicalContent({ drug }: { drug: DrugName }) {
    const reference = getDrugReference(drug);
    const doseLines = getStandardDoseLines(drug, ageMonths, ageDays, weightKg, heightCm);
    const adjustments = getDoseAdjustments(drug, effectiveOrgan, weightKg, heightCm);
    const interactions = getInteractionWarnings(drug, effectiveMedications);
    return (
      <div className="clinical-content">
        <section className="clinical-block standard-dose"><h4>��׼����</h4><ul>{doseLines.map((line) => <li key={line}>{line}</li>)}</ul></section>
        {adjustments.length ? <section className="clinical-block adjustment-block"><h4>�������� / ���ٹ�����ʾ</h4><ul>{adjustments.map((line) => <li key={line}>{line}</li>)}</ul></section> : null}
        {reference?.administration.length ? <section className="clinical-block"><h4>��ҩ��ʽ</h4><ul>{reference.administration.map((line) => <li key={line}>{line}</li>)}</ul></section> : null}
        {reference?.precautions.length ? <section className="clinical-block warning-block"><h4>��ҩע������</h4><ul>{reference.precautions.map((line) => <li key={line}>{line}</li>)}</ul></section> : null}
        <section className="clinical-block interaction-block">
          <h4>ҩ���໥����</h4>
          {interactions.length ? <div className="interaction-list">{interactions.map((item) => <p key={`${item.label}-${item.text}`}><strong>{item.label}��</strong>{item.text}</p>)}</div> : <p className="no-interaction">��ǰ��д����δ���и�ҩ���������г��������໥���á�</p>}
        </section>
      </div>
    );
  }

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="���ض���"><span className="brand-mark">AF</span><span><strong>Antifungal Compass</strong><small>��ͯѪҺϵͳ���������Ԥ����������</small></span></a>
        <div className="header-actions"><span className="privacy-pill"><span /> ���ݽ��ڱ�������</span><button className="ghost-button" type="button" onClick={resetAll}>������д</button></div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">RULE-BASED �� VERSION 0.2</div>
        <h1>�Ѹ��ӵ�Ԥ�����̣�<br /><em>�����������׷�ݵ��жϡ�</em></h1>
        <p>������д�����������ա����ƽ׶Ρ����ٹ��ܺͺϲ���ҩ���鿴���շֲ㡢��ѡҩ��������໥���á�</p>
        <div className="hero-notice"><strong>�о��������ʾ��;</strong><span>������������Ŀ����ʵ�֣�������ٴ���ϡ�������˻���廯���ƾ��ߡ�</span></div>
      </section>

      <section className="calculator-shell" aria-label="�����Ԥ��������">
        <nav className="step-nav five-steps" aria-label="��д����">
          {stepTitles.map((title, index) => <button key={title} type="button" className={`${step === index ? "active" : ""} ${step > index ? "done" : ""}`} onClick={() => setStep(index)}><span>{step > index ? "?" : index + 1}</span>{title}</button>)}
        </nav>

        <div className="workspace">
          <div className="form-panel">
            {step === 0 ? (
              <section className="step-section">
                <div className="section-heading"><span className="section-number">01</span><div><h2>������������</h2><p>����ɰ��졢�»�����д�������������Ͷ�ͯ�����ֲ㡣</p></div></div>
                <div className="field-grid three-columns">
                  <label className="input-field"><span>����</span><div className="input-with-unit"><input type="number" min="0" step="0.1" value={ageValue} onChange={(event) => setAgeValue(Number(event.target.value))} /><select value={ageUnit} onChange={(event) => setAgeUnit(event.target.value as AgeUnit)} aria-label="���䵥λ"><option value="days">��</option><option value="months">����</option><option value="years">��</option></select></div></label>
                  <label className="input-field"><span>����</span><div className="input-with-unit"><input type="number" min="0" step="0.1" value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} /><b>kg</b></div></label>
                  <label className="input-field"><span>����</span><div className="input-with-unit"><input type="number" min="0" step="0.1" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} /><b>cm</b></div></label>
                </div>
                <div className="subsection"><div className="subsection-title"><h3>IFD������</h3><span>ԭʼԤ�������׸��жϽڵ�</span></div><div className="switch-grid">
                  <SwitchField label="��ǰȷ�������IFD" checked={ifd.currentIfd} onChange={(value) => setIfd((current) => ({ ...current, currentIfd: value }))} />
                  <SwitchField label="Ӱ��ѧ�ı��G/GM����" checked={ifd.imagingOrMarkerPositive} onChange={(value) => setIfd((current) => ({ ...current, imagingOrMarkerPositive: value }))} />
                  <SwitchField label="������IFD��ʷ" checked={ifd.previousIfd} onChange={(value) => setIfd((current) => ({ ...current, previousIfd: value }))} />
                </div><p className="inline-note">�������ṩ��ȷ�ϵ�ԭ���̣�������һ������ʱ������Ƽ�����Ԥ�������������������ݡ�</p></div>
              </section>
            ) : null}

            {step === 1 ? (
              <section className="step-section">
                <div className="section-heading"><span className="section-number">02</span><div><h2>����Σ�շּ�</h2><p>���淶��ϡ��������ա����ƽ׶��븽��Σ�����ؼ��㡣</p></div></div>

                <div className="question-block"><div className="question-kicker">������� �� ��4��</div><SelectField label="�������ͣ���ѡ������Ҫ��ϣ�" value={questionnaire.diagnosis} options={diagnosisOptions} onChange={setDiagnosis} />
                  {questionnaire.diagnosis === "ALL" ? <div className="conditional-grid"><SelectField label="4a. ALL����" value={questionnaire.allSubtype} options={[["B-ALL", "B-ALL"], ["T-ALL", "T-ALL"], ["NK-ALL", "NK-ALL"], ["MPAL", "��ϱ��ͼ��԰�Ѫ����MPAL��"], ["other", "����/����"]]} onChange={(value) => updateQuestionnaire("allSubtype", value as QuestionnaireInputs["allSubtype"])} /><SelectField label="4b. �ѳ�Ⱦɫ�壨Ph��" value={questionnaire.phStatus} options={[["positive", "����"], ["negative", "����"]]} onChange={(value) => updateQuestionnaire("phStatus", value as QuestionnaireInputs["phStatus"])} /></div> : null}
                  {questionnaire.diagnosis === "AML" ? <div className="conditional-grid"><SelectField label="4c. AML����" value={questionnaire.amlSubtype} options={["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7"].map((item) => [item, item] as const).concat([["other", "����/����"]])} onChange={(value) => updateQuestionnaire("amlSubtype", value as QuestionnaireInputs["amlSubtype"])} /></div> : null}
                  {questionnaire.diagnosis === "lymphoma" ? <div className="conditional-grid"><SelectField label="4d. �ܰ�������" value={questionnaire.lymphomaSubtype} options={[["cHL", "�����ͻ�����ܰ�����cHL��"], ["NLPHL", "������ܰ�ϸ��Ϊ���ͻ�����ܰ�����NLPHL��"], ["BL", "�������ܰ�����BL��"], ["DLBCL", "������Bϸ���ܰ�����DLBCL��"], ["PMBCL", "ԭ���ݸ���Bϸ���ܰ�����PMBCL��"], ["T-LBL", "�ܰ�ĸϸ���ܰ�����T-LBL��"], ["ALCL", "����Դ�ϸ���ܰ�����ALCL��"], ["other", "����/����"]]} onChange={(value) => updateQuestionnaire("lymphomaSubtype", value as QuestionnaireInputs["lymphomaSubtype"])} /></div> : null}
                  {questionnaire.diagnosis === "MDS" ? <div className="conditional-grid"><SelectField label="4e. MDS����" value={questionnaire.mdsSubtype} options={[["MDS-LB", "MDS-LB����ԭʼϸ���ͣ�"], ["MDS-IB", "MDS-IB��ԭʼϸ�������ͣ�"], ["other", "����/����"]]} onChange={(value) => updateQuestionnaire("mdsSubtype", value as QuestionnaireInputs["mdsSubtype"])} /></div> : null}
                </div>

                <div className="question-block"><div className="question-kicker">�������� �� ��5��</div>
                  {["ALL", "AML", "MDS"].includes(questionnaire.diagnosis) ? <SelectField label="5a. �������շּ�" value={questionnaire.diseaseRisk} options={[["low", "��Σ"], ["intermediate", "��Σ"], ["high", "��Σ"]]} onChange={(value) => updateQuestionnaire("diseaseRisk", value as QuestionnaireInputs["diseaseRisk"])} /> : null}
                  {questionnaire.diagnosis === "lymphoma" ? <div className="conditional-grid"><SelectField label="5b. ��������" value={questionnaire.lymphomaStage} options={[["I-II", "I�CII��"], ["III-IV", "III�CIV��"]]} onChange={(value) => updateQuestionnaire("lymphomaStage", value as QuestionnaireInputs["lymphomaStage"])} /><SelectField label="5c. �Ƿ��Σ" value={questionnaire.lymphomaHighRisk} options={[["yes", "��"], ["no", "��"]]} onChange={(value) => updateQuestionnaire("lymphomaHighRisk", value as QuestionnaireInputs["lymphomaHighRisk"])} /></div> : null}
                  {questionnaire.diagnosis === "CML" ? <SelectField label="5d. CML�����׶�" value={questionnaire.cmlPhase} options={[["chronic", "������"], ["accelerated", "������"], ["blast", "������"], ["other", "����/����"]]} onChange={(value) => updateQuestionnaire("cmlPhase", value as QuestionnaireInputs["cmlPhase"])} /> : null}
                  {!questionnaire.diagnosis || questionnaire.diagnosis === "other" ? <p className="empty-inline">ѡ��ɷּ���Ϻ���ʾ��Ӧ������Ŀ��</p> : null}
                  <div className="calculated-risk"><span>��ǰ����Σ�շּ�</span><strong>{diseaseRisk.label}</strong><small>{diseaseRisk.detail}</small></div>
                </div>

                <div className="question-block"><div className="question-kicker">��ǰ���ƽ׶�����ֲ״̬ �� ��6��</div><SelectField label="6. ��ǰ���ƽ׶�" value={questionnaire.treatmentStage} options={[["induction", "�յ�"], ["consolidation", "����/ǿ��"], ["maintenance", "ά��"], ["refractory-relapse", "����/����"], ["hsct", "��Ѫ��ϸ����ֲ��HSCT��"]]} onChange={(value) => updateQuestionnaire("treatmentStage", value as QuestionnaireInputs["treatmentStage"])} />
                  {questionnaire.treatmentStage === "hsct" ? <div className="conditional-grid"><SelectField label="6a. ��ֲ����" value={questionnaire.hsctType} options={[["allo", "�������Ѫ��ϸ����ֲ��allo-HSCT��"], ["auto", "������Ѫ��ϸ����ֲ��auto-HSCT��"]]} onChange={(value) => updateQuestionnaire("hsctType", value as QuestionnaireInputs["hsctType"])} /><SelectField label="6b. ��ֲ�׶�" value={questionnaire.hsctStage} options={[["pre", "ֲ��ǰ��Ԥ��������ϸ��ֲ��ǰ��"], ["post", "ֲ���"]]} onChange={(value) => updateQuestionnaire("hsctStage", value as QuestionnaireInputs["hsctStage"])} /></div> : null}
                  {questionnaire.treatmentStage === "hsct" && questionnaire.hsctStage === "post" ? <div className="conditional-grid"><SelectField label="6b1. �Ƿ���GVHD" value={questionnaire.gvhdStatus} options={[["none", "δ����"], ["acute-I-II", "����GVHD I�CII��"], ["acute-III-IV", "����GVHD III�CIV��"], ["chronic", "����GVHD"]]} onChange={(value) => updateQuestionnaire("gvhdStatus", value as QuestionnaireInputs["gvhdStatus"])} /></div> : null}
                </div>

                <div className="question-block"><div className="question-kicker">ȫ�����߻��ܰ�ϸ���������� �� ��7��</div><SwitchField label="δ������������" checked={questionnaire.immuneTherapies.length === 0} onChange={(checked) => checked && updateQuestionnaire("immuneTherapies", [])} /><div className="top-gap"><CheckGrid options={immuneTherapyOptions} selected={questionnaire.immuneTherapies} onToggle={(value, checked) => toggleQuestionnaireList("immuneTherapies", value, checked)} /></div>
                  {questionnaire.immuneTherapies.includes("small-molecule") ? <div className="conditional-panel"><strong>7G. ����ʹ�õ�С���Ӱ���ҩ��ɶ�ѡ��</strong><CheckGrid options={smallMoleculeOptions} selected={questionnaire.smallMoleculeTherapies} onToggle={(value, checked) => toggleQuestionnaireList("smallMoleculeTherapies", value, checked)} /></div> : null}
                  {questionnaire.immuneTherapies.includes("calcineurin-mtor") ? <div className="conditional-panel"><strong>7H. �Ƶ�����ø���Ƽ�/mTOR���Ƽ����ɶ�ѡ��</strong><CheckGrid options={calcineurinMtorOptions} selected={questionnaire.calcineurinMtorTherapies} onToggle={(value, checked) => toggleQuestionnaireList("calcineurinMtorTherapies", value, checked)} /></div> : null}
                </div>

                <div className="question-block"><div className="question-kicker">�������Σ������</div><div className="switch-grid">
                  <SwitchField label="������ϸ������Ԥ�Ƴ���10��" checked={questionnaire.neutropeniaOver10Days} onChange={(checked) => setQuestionnaire((current) => ({ ...current, neutropeniaOver10Days: checked, neutropeniaOver14Days: checked ? current.neutropeniaOver14Days : false }))} />
                  <SwitchField label="������ϸ������Ԥ�Ƴ���14��" hint="����ҩ��ѡ���еĳ���������ϸ�����ٽڵ�" checked={questionnaire.neutropeniaOver14Days} onChange={(checked) => setQuestionnaire((current) => ({ ...current, neutropeniaOver14Days: checked, neutropeniaOver10Days: checked || current.neutropeniaOver10Days }))} />
                  <SwitchField label="�����ɵ�Ч������0.3 mg/(kg��d)��������3��" checked={questionnaire.steroidExposure} onChange={(checked) => updateQuestionnaire("steroidExposure", checked)} />
                  <SwitchField label="�����������ùܲ�����������еͨ����" checked={questionnaire.invasiveDevice} onChange={(checked) => updateQuestionnaire("invasiveDevice", checked)} />
                </div></div>

                <div className="question-block"><div className="question-kicker">����Σ������ �� �ʾ���11��</div><CheckGrid options={additionalRiskFactors} selected={questionnaire.additionalFactors} onToggle={(value, checked) => toggleQuestionnaireList("additionalFactors", value, checked)} /></div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="step-section">
                <div className="section-heading"><span className="section-number">03</span><div><h2>ҩ��ѡ����</h2><p>��ǰ��ҳ����ʵʱ���ɣ�QTc�ӳ������Ӱ�ɳ���򣬲�ɾ��ԭ�к�ѡҩ�</p></div></div>
                <div className="switch-grid single-column"><SwitchField label="������ɻ�θ�������ղ���" hint="������ʾ�׿��Ҿ�������ʹ�ó���" checked={questionnaire.azoleIssue} onChange={(checked) => updateQuestionnaire("azoleIssue", checked)} /></div>
                <div className="candidate-preview"><div className="subsection-title"><h3>��ǰ��ѡҩ��</h3><span>����д����ʵʱ����</span></div>
                  {candidates.length ? <div className="candidate-list">{candidates.map((drug) => <article key={drug.name} className="candidate-card"><div><strong>{drug.name}</strong><span className={`rank rank-${drug.rank}`}>{drug.rank}</span></div><p>{drug.note ?? "����ǰ���Ϲ������"}</p>{drug.offLabel ? <div className="off-label">18�����³�˵������ҩ �� ���ٴ�����</div> : null}</article>)}</div> : <div className="empty-state">��ǰԤ��·��δ���ɺ�ѡҩ�����Σ�շּ�ҳ����ϡ����ƽ׶κ�Σ�����ء�</div>}
                </div>
                <div className="mapping-note"><strong>��ǰ����ӳ��</strong><p>{riskInputs.amlHighRisk ? "��ΣAML" : riskInputs.highRiskAll ? "��Σ/Tϸ��/Ӥ��/Ph+ ALL" : riskInputs.hsct ? "��Ѫ��ϸ����ֲ·��" : riskInputs.systemicImmuneTherapy ? "����/�ܰ�ϸ����������·��" : "���漲��·��"}</p></div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="step-section">
                <div className="section-heading"><span className="section-number">04</span><div><h2>���ٹ�����ϲ���ҩ</h2><p>�����ڶ�Ӧҩ�￨��������������;����໥���á�</p></div></div>
                <div className="field-grid two-columns">
                  <SelectField label="������״̬" value={organ.renalStatus} options={[["normal", "����"], ["impaired", "��������"], ["dialysis", "���ڽ���ѪҺ͸��"]]} onChange={(value) => setOrgan((current) => ({ ...current, renalStatus: value as RenalStatus }))} />
                  <SelectField label="�ι���״̬" value={organ.hepaticStatus} options={[["normal", "����"], ["abnormal", "�ι����쳣���ּ�����"], ["child-ab", "Child-Pugh A/B��"], ["child-c", "Child-Pugh C��"]]} onChange={(value) => setOrgan((current) => ({ ...current, hepaticStatus: value as HepaticStatus }))} />
                </div>
                <p className="inline-note">���ٹ���δ��дʱ�����ƶ�Ϊ������ϵͳֻ�����������ȷ�����ĵ������⽨�顣</p>
                <div className="subsection"><div className="subsection-title"><h3>��ǰ�ϲ���ҩ</h3><span>�ɶ�ѡ��ǰһҳ����ҩ����Զ�����</span></div>
                  {medicationGroups.map((group) => <div className="medication-group" key={group.title}><h4>{group.title}</h4><div className="check-list">{group.options.map((option) => {
                    const inferred = inferredMedicationKeys.includes(option.key); const checked = effectiveMedications.includes(option.key);
                    return <label key={option.key} className={`${checked ? "checked" : ""} ${inferred ? "is-derived" : ""}`}><input type="checkbox" checked={checked} disabled={inferred} onChange={(event) => setOrgan((current) => ({ ...current, medications: event.target.checked ? Array.from(new Set([...current.medications, option.key])) : current.medications.filter((item) => item !== option.key) }))} /><span className="custom-check">?</span><span>{option.label}{inferred ? <small>�ɵ�7���Զ�����</small> : null}</span></label>;
                  })}</div></div>)}
                </div>
              </section>
            ) : null}

            {step === 4 ? (
              <section className="step-section">
                <div className="section-heading"><span className="section-number">05</span><div><h2>��������ҩ�ο�</h2><p>����ʾ��ǰ��ѡҩ���׼������ǰ������������໥���������ʾ��</p></div></div>
                <div className="recommended-dose-section"><div className="subsection-title"><h3>��ǰ��ѡҩ�����</h3><span>����ʾ�Ƽ���ɿ���ҩ��</span></div>
                  {candidates.length ? <div className="clinical-card-list">{candidates.map((candidate) => <article className="clinical-card featured" key={candidate.name}><header><div><strong>{candidate.name}</strong><span className={`rank rank-${candidate.rank}`}>{candidate.rank}</span></div>{candidate.offLabel ? <small>18�����³�˵����</small> : null}</header><DrugClinicalContent drug={candidate.name} /></article>)}</div> : <div className="empty-state">��ǰû�к�ѡҩ���������ʾ���������Σ�շּ���ҩ��ѡ��</div>}
                </div>
                <div className="reference-section"><div className="subsection-title"><h3>����ҩ�������ο���</h3><span>���ҩ������չ��</span></div><div className="reference-grid clinical-reference-grid">{remainingReferences.map((reference) => <details key={reference.drug}><summary><strong>{reference.drug}</strong><span>�鿴������ע������</span></summary><DrugClinicalContent drug={reference.drug} /></details>)}</div></div>
                <div className="reference-section tdm-section"><div className="subsection-title"><h3>TDM���ֲο�</h3><span>����չʾ�������д���ж�</span></div><div className="tdm-grid">{tdmReference.map((item) => <details key={item.drug}><summary><strong>{item.drug}</strong><span>չ��</span></summary><dl>{item.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>)}</div></div>
              </section>
            ) : null}

            <div className="form-footer"><button type="button" className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>��һ��</button>{step < 4 ? <button type="button" className="primary-button" onClick={() => setStep((current) => Math.min(4, current + 1))}>���� <span>��</span></button> : <button type="button" className="primary-button" onClick={() => window.print()}>��ӡ��� <span>�J</span></button>}</div>
          </div>

          <aside className="result-panel" aria-live="polite">
            <div className="result-topline"><span>ʵʱ�������</span><ResultBadge level={prevention.level} /></div>
            <div className="risk-summary-grid"><div><span>����Σ�շּ�</span><strong>{diseaseRisk.label}</strong></div><div><span>�����Ԥ������</span><strong>{prevention.riskBand}</strong></div></div>
            <h2>{prevention.title}</h2><p>{prevention.detail}</p>
            <div className="trace-box"><strong>�ж�����</strong><ol>{prevention.trace.map((item, index) => <li key={`${item}-${index}`}><span>{index + 1}</span>{item}</li>)}</ol></div>
            <div className="result-candidates"><strong>��ѡҩ��</strong>{candidates.length ? candidates.map((drug) => <div key={drug.name}><span>{drug.name}</span><b>{drug.rank}</b>{drug.offLabel ? <small>��˵����</small> : null}</div>) : <p>��ǰ�޺�ѡҩ�����</p>}</div>
            <div className="result-demographics"><div><span>����</span><strong>{ageValue} {ageUnit === "years" ? "��" : ageUnit === "months" ? "����" : "��"}</strong></div><div><span>����</span><strong>{weightKg} kg</strong></div><div><span>����</span><strong>{heightCm} cm</strong></div></div>
            <button className="copy-button" type="button" onClick={copySummary}>{copyState}</button><small className="result-disclaimer">������������ݵ�ǰ��Ŀ����汾���ɣ�����רҵ��Ա��ϻ���ʵ��������ˡ�</small>
          </aside>
        </div>
      </section>
      <footer><div><strong>Antifungal Compass</strong><p>��Դ������ʾ��Ŀ �� ���ռ����ϴ���������</p></div><a href="#top">���ض��� ��</a></footer>
    </main>
  );
}

