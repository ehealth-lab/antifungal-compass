"use client";

import { useMemo, useState } from "react";
import { drugNotes, generalRiskFactors, tdmReference } from "./reference-data";
import {
  ageToMonths,
  calculateCaspofungin,
  calculateMicafungin,
  calculatePosaconazole,
  evaluatePrevention,
  selectDrugCandidates,
  type AgeUnit,
  type RiskInputs,
} from "./rules";

type DoseDrug = "micafungin" | "posaconazole-tablet" | "posaconazole-suspension" | "caspofungin";

const initialRisk: RiskInputs = {
  currentIfd: false,
  imagingOrMarkerPositive: false,
  previousIfd: false,
  hsct: false,
  preEngraftment: false,
  alloHsctWithGvhdOrTherapy: false,
  systemicImmuneTherapy: false,
  atg: false,
  leukemia: false,
  aml: false,
  amlHighRisk: false,
  highRiskAll: false,
  consolidationOrIntensification: false,
  inductionRefractoryRelapse: false,
  hodgkinLymphoma: false,
  generalRiskFactor: false,
};

const stepTitles = ["患儿资料", "预防评估", "药物选择", "剂量与参考"];

function SwitchField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={`switch-field ${checked ? "is-checked" : ""}`}>
      <span className="switch-copy">
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true"><span /></span>
    </label>
  );
}

function ResultBadge({ level }: { level: string }) {
  const labels: Record<string, string> = {
    secondary: "二级预防",
    recommended: "推荐预防",
    consider: "可考虑",
    monitor: "密切监测",
    "not-routine": "不常规预防",
  };
  return <span className={`result-badge level-${level}`}>{labels[level] ?? level}</span>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [ageValue, setAgeValue] = useState(8);
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("years");
  const [weightKg, setWeightKg] = useState(25);
  const [heightCm, setHeightCm] = useState(125);
  const [risk, setRisk] = useState<RiskInputs>(initialRisk);
  const [riskFactorStates, setRiskFactorStates] = useState<boolean[]>(generalRiskFactors.map(() => false));
  const [qtcProlonged, setQtcProlonged] = useState(false);
  const [prolongedNeutropenia, setProlongedNeutropenia] = useState(false);
  const [azoleIssue, setAzoleIssue] = useState(false);
  const [doseDrug, setDoseDrug] = useState<DoseDrug>("micafungin");
  const [micafunginMode, setMicafunginMode] = useState<"daily" | "twice-weekly">("daily");
  const [copyState, setCopyState] = useState("复制结果");

  const ageMonths = ageToMonths(ageValue, ageUnit);
  const derivedRisk = useMemo(
    () => ({ ...risk, generalRiskFactor: riskFactorStates.some(Boolean) }),
    [risk, riskFactorStates],
  );
  const prevention = useMemo(() => evaluatePrevention(derivedRisk), [derivedRisk]);
  const candidates = useMemo(
    () =>
      selectDrugCandidates({
        preventionLevel: prevention.level,
        patientAgeMonths: ageMonths,
        imagingOrMarkerPositive: risk.imagingOrMarkerPositive,
        amlInduction: risk.aml && risk.inductionRefractoryRelapse,
        hsct: risk.hsct,
        prolongedNeutropenia,
        qtcProlonged,
        azoleContraindicatedOrPoorAbsorption: azoleIssue,
      }),
    [prevention.level, risk, prolongedNeutropenia, qtcProlonged, azoleIssue, ageMonths],
  );

  const doseResult = useMemo(() => {
    if (doseDrug === "micafungin") return calculateMicafungin(weightKg);
    if (doseDrug === "posaconazole-tablet") return calculatePosaconazole("tablet", ageMonths, weightKg);
    if (doseDrug === "posaconazole-suspension") return calculatePosaconazole("suspension", ageMonths, weightKg);
    return calculateCaspofungin(weightKg, heightCm);
  }, [doseDrug, weightKg, heightCm, ageMonths]);

  function setRiskValue<K extends keyof RiskInputs>(key: K, value: RiskInputs[K]) {
    setRisk((current) => ({ ...current, [key]: value }));
  }

  function resetAll() {
    setStep(0);
    setAgeValue(8);
    setAgeUnit("years");
    setWeightKg(25);
    setHeightCm(125);
    setRisk(initialRisk);
    setRiskFactorStates(generalRiskFactors.map(() => false));
    setQtcProlonged(false);
    setProlongedNeutropenia(false);
    setAzoleIssue(false);
    setDoseDrug("micafungin");
  }

  async function copySummary() {
    const candidateText = candidates.length
      ? candidates.map((item) => `${item.name}（${item.rank}${item.offLabel ? "，超说明书" : ""}）`).join("、")
      : "当前路径未生成候选药物";
    const text = [
      "抗真菌预防决策结果",
      `年龄：${ageValue}${ageUnit === "years" ? "岁" : "个月"}；体重：${weightKg} kg；身高：${heightCm} cm`,
      `预防结论：${prevention.title}`,
      `依据：${prevention.trace.join("；")}`,
      `候选药物：${candidateText}`,
      "提示：结果依据项目资料规则生成，不替代临床诊断、处方审核或个体化治疗决策。",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("已复制");
      window.setTimeout(() => setCopyState("复制结果"), 1600);
    } catch {
      setCopyState("复制失败");
    }
  }

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="返回顶部">
          <span className="brand-mark">AF</span>
          <span>
            <strong>Antifungal Compass</strong>
            <small>儿童血液系统疾病抗真菌预防辅助工具</small>
          </span>
        </a>
        <div className="header-actions">
          <span className="privacy-pill"><span /> 数据仅在本机处理</span>
          <button className="ghost-button" type="button" onClick={resetAll}>重新填写</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">RULE-BASED · VERSION 0.1</div>
        <h1>把复杂的预防流程，<br /><em>变成清晰、可追溯的判断。</em></h1>
        <p>依次填写患儿资料、危险因素与治疗阶段，获得预防建议、候选药物和已确认规则的剂量结果。</p>
        <div className="hero-notice">
          <strong>研究与规则演示用途</strong>
          <span>本工具依据项目资料实现，不替代临床诊断、处方审核或个体化治疗决策。</span>
        </div>
      </section>

      <section className="calculator-shell" aria-label="抗真菌预防计算器">
        <nav className="step-nav" aria-label="填写步骤">
          {stepTitles.map((title, index) => (
            <button
              key={title}
              type="button"
              className={`${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
              onClick={() => setStep(index)}
            >
              <span>{step > index ? "✓" : index + 1}</span>
              {title}
            </button>
          ))}
        </nav>

        <div className="workspace">
          <div className="form-panel">
            {step === 0 ? (
              <section className="step-section">
                <div className="section-heading">
                  <span className="section-number">01</span>
                  <div><h2>患儿基本资料</h2><p>用于年龄分层、体重剂量与体表面积计算。</p></div>
                </div>
                <div className="field-grid three-columns">
                  <label className="input-field">
                    <span>年龄</span>
                    <div className="input-with-unit">
                      <input type="number" min="0" step="0.1" value={ageValue} onChange={(e) => setAgeValue(Number(e.target.value))} />
                      <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value as AgeUnit)} aria-label="年龄单位">
                        <option value="years">岁</option><option value="months">个月</option>
                      </select>
                    </div>
                  </label>
                  <label className="input-field">
                    <span>体重</span>
                    <div className="input-with-unit"><input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} /><b>kg</b></div>
                  </label>
                  <label className="input-field">
                    <span>身高</span>
                    <div className="input-with-unit"><input type="number" min="0" step="0.1" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} /><b>cm</b></div>
                  </label>
                </div>
                <div className="subsection">
                  <div className="subsection-title"><h3>IFD相关情况</h3><span>原始预防流程的首个判断节点</span></div>
                  <div className="switch-grid">
                    <SwitchField label="当前确诊或疑似IFD" checked={risk.currentIfd} onChange={(v) => setRiskValue("currentIfd", v)} />
                    <SwitchField label="影像学改变或G/GM阳性" checked={risk.imagingOrMarkerPositive} onChange={(v) => setRiskValue("imagingOrMarkerPositive", v)} />
                    <SwitchField label="既往有IFD病史" checked={risk.previousIfd} onChange={(v) => setRiskValue("previousIfd", v)} />
                  </div>
                  <p className="inline-note">按资料提供者确认的原流程，以上任一项命中时输出“推荐二级预防”；本工具会保留命中依据。</p>
                </div>
              </section>
            ) : null}

            {step === 1 ? (
              <section className="step-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div><h2>预防风险评估</h2><p>按移植、免疫治疗、疾病类型与附加危险因素逐级判断。</p></div>
                </div>
                <div className="subsection">
                  <div className="subsection-title"><h3>移植与免疫治疗</h3><span>按实际情况勾选</span></div>
                  <div className="switch-grid">
                    <SwitchField label="正在进行造血干细胞移植" checked={risk.hsct} onChange={(v) => setRiskValue("hsct", v)} />
                    <SwitchField label="处于植入前阶段" checked={risk.preEngraftment} onChange={(v) => setRiskValue("preEngraftment", v)} />
                    <SwitchField label="异基因HSCT合并GVHD或免疫/靶向治疗" checked={risk.alloHsctWithGvhdOrTherapy} onChange={(v) => setRiskValue("alloHsctWithGvhdOrTherapy", v)} />
                    <SwitchField label="全身免疫或淋巴细胞靶向治疗" checked={risk.systemicImmuneTherapy} onChange={(v) => setRiskValue("systemicImmuneTherapy", v)} />
                    <SwitchField label="接受ATG" checked={risk.atg} onChange={(v) => setRiskValue("atg", v)} />
                  </div>
                </div>
                <div className="subsection">
                  <div className="subsection-title"><h3>血液系统疾病</h3><span>用于对应原始流程分支</span></div>
                  <div className="switch-grid">
                    <SwitchField label="白血病" checked={risk.leukemia} onChange={(v) => setRiskValue("leukemia", v)} />
                    <SwitchField label="AML" checked={risk.aml} onChange={(v) => setRiskValue("aml", v)} />
                    <SwitchField label="高危AML" checked={risk.amlHighRisk} onChange={(v) => setRiskValue("amlHighRisk", v)} />
                    <SwitchField label="高危/T细胞/婴儿/Ph+ ALL" checked={risk.highRiskAll} onChange={(v) => setRiskValue("highRiskAll", v)} />
                    <SwitchField label="巩固或强化化疗阶段" checked={risk.consolidationOrIntensification} onChange={(v) => setRiskValue("consolidationOrIntensification", v)} />
                    <SwitchField label="诱导/难治/复发治疗阶段" checked={risk.inductionRefractoryRelapse} onChange={(v) => setRiskValue("inductionRefractoryRelapse", v)} />
                    <SwitchField label="霍奇金淋巴瘤" checked={risk.hodgkinLymphoma} onChange={(v) => setRiskValue("hodgkinLymphoma", v)} />
                  </div>
                </div>
                <div className="subsection">
                  <div className="subsection-title"><h3>附加危险因素</h3><span>任一项勾选即视为合并危险因素</span></div>
                  <div className="check-list">
                    {generalRiskFactors.map((factor, index) => (
                      <label key={factor} className={riskFactorStates[index] ? "checked" : ""}>
                        <input
                          type="checkbox"
                          checked={riskFactorStates[index]}
                          onChange={(e) => setRiskFactorStates((current) => current.map((value, i) => (i === index ? e.target.checked : value)))}
                        />
                        <span className="custom-check">✓</span>{factor}
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="step-section">
                <div className="section-heading">
                  <span className="section-number">03</span>
                  <div><h2>药物选择条件</h2><p>依据已确认规则补充QTc、长期中性粒细胞减少和吸收条件。</p></div>
                </div>
                <div className="switch-grid single-column">
                  <SwitchField
                    label="QTc间期延长（问卷11题F）"
                    hint="勾选后，在原候选药物基础上增加艾沙康唑（可考虑）"
                    checked={qtcProlonged}
                    onChange={setQtcProlonged}
                  />
                  <SwitchField
                    label="长期中性粒细胞减少"
                    hint="命中时艾沙康唑可考虑；本工具按资料中的＞14天节点展示"
                    checked={prolongedNeutropenia}
                    onChange={setProlongedNeutropenia}
                  />
                  <SwitchField
                    label="唑类禁忌或胃肠道吸收不良"
                    hint="用于提示米卡芬净的条件使用场景"
                    checked={azoleIssue}
                    onChange={setAzoleIssue}
                  />
                </div>
                <div className="candidate-preview">
                  <div className="subsection-title"><h3>当前候选药物</h3><span>随填写内容实时更新</span></div>
                  {candidates.length ? (
                    <div className="candidate-list">
                      {candidates.map((drug) => (
                        <article key={drug.name} className="candidate-card">
                          <div><strong>{drug.name}</strong><span className={`rank rank-${drug.rank}`}>{drug.rank}</span></div>
                          {drug.note ? <p>{drug.note}</p> : <p>按当前资料规则输出</p>}
                          {drug.offLabel ? <div className="off-label">18岁以下超说明书用药 · 需临床评估</div> : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">当前预防路径未生成候选药物。请检查前一页评估结果。</div>
                  )}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="step-section">
                <div className="section-heading">
                  <span className="section-number">04</span>
                  <div><h2>已确认规则的剂量计算</h2><p>仅对边界清楚且已确认的剂量自动计算，其余药物保留原文参考。</p></div>
                </div>
                <div className="drug-tabs" role="tablist" aria-label="选择计算药物">
                  {[
                    ["micafungin", "米卡芬净"],
                    ["posaconazole-tablet", "泊沙康唑肠溶片"],
                    ["posaconazole-suspension", "泊沙康唑混悬液"],
                    ["caspofungin", "卡泊芬净"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" className={doseDrug === value ? "active" : ""} onClick={() => setDoseDrug(value as DoseDrug)}>{label}</button>
                  ))}
                </div>

                <div className="dose-card">
                  {doseDrug === "micafungin" && doseResult ? (
                    <>
                      <div className="segmented-control">
                        <button className={micafunginMode === "daily" ? "active" : ""} type="button" onClick={() => setMicafunginMode("daily")}>每日方案</button>
                        <button className={micafunginMode === "twice-weekly" ? "active" : ""} type="button" onClick={() => setMicafunginMode("twice-weekly")}>每周2次方案</button>
                      </div>
                      <div className="dose-output">
                        <span>计算结果</span>
                        <strong>{micafunginMode === "daily" && "daily" in doseResult ? doseResult.daily : "twiceWeekly" in doseResult ? doseResult.twiceWeekly : "—"} <small>mg / 次</small></strong>
                        <p>{micafunginMode === "daily" ? "1 mg/kg，每日1次；最大50 mg/次" : "4 mg/kg，每周2次；资料未给出单次最大剂量"}</p>
                      </div>
                    </>
                  ) : null}

                  {(doseDrug === "posaconazole-tablet" || doseDrug === "posaconazole-suspension") && doseResult ? (
                    "available" in doseResult && doseResult.available ? (
                      "loading" in doseResult ? (
                        <div className="dose-split">
                          <div><span>负荷剂量</span><strong>{doseResult.loading}</strong></div>
                          <div><span>维持剂量</span><strong>{doseResult.maintenance}</strong></div>
                        </div>
                      ) : (
                        <div className="dose-output">
                          <span>单次剂量</span><strong>{doseResult.dose} <small>mg / 次</small></strong>
                          <p>{doseResult.frequency} · {doseResult.note}</p>
                        </div>
                      )
                    ) : (
                      <div className="dose-unavailable"><strong>不生成剂量</strong><p>{"reason" in doseResult ? doseResult.reason : "当前条件暂无计算规则。"}</p></div>
                    )
                  ) : null}

                  {doseDrug === "caspofungin" && doseResult && "bsa" in doseResult ? (
                    <>
                      <div className="bsa-line"><span>Mosteller体表面积</span><strong>{doseResult.bsa} m²</strong></div>
                      <div className="dose-split">
                        <div><span>首日负荷剂量</span><strong>{doseResult.loading} mg</strong><small>70 mg/m²，最大70 mg</small></div>
                        <div><span>维持剂量</span><strong>{doseResult.maintenance} mg / 日</strong><small>50 mg/m²，最大70 mg</small></div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="reference-section">
                  <div className="subsection-title"><h3>其他药物参考卡</h3><span>不参与自动计算</span></div>
                  <div className="reference-grid">
                    {drugNotes.map((note) => (
                      <details key={note.drug}>
                        <summary><strong>{note.drug}</strong><span>查看</span></summary>
                        <p>{note.summary}</p><small><b>相互作用提示：</b>{note.interactions}</small>
                      </details>
                    ))}
                  </div>
                </div>

                <div className="reference-section tdm-section">
                  <div className="subsection-title"><h3>TDM文字参考</h3><span>按要求完整展示，不进行达标判断</span></div>
                  <div className="tdm-grid">
                    {tdmReference.map((item) => (
                      <details key={item.drug}>
                        <summary><strong>{item.drug}</strong><span>展开</span></summary>
                        <dl>{item.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <div className="form-footer">
              <button type="button" className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>上一步</button>
              {step < 3 ? <button type="button" className="primary-button" onClick={() => setStep((current) => Math.min(3, current + 1))}>继续 <span>→</span></button> : <button type="button" className="primary-button" onClick={() => window.print()}>打印结果 <span>↗</span></button>}
            </div>
          </div>

          <aside className="result-panel" aria-live="polite">
            <div className="result-topline"><span>实时评估结果</span><ResultBadge level={prevention.level} /></div>
            <h2>{prevention.title}</h2>
            <p>{prevention.detail}</p>
            <div className="trace-box">
              <strong>判断依据</strong>
              <ol>{prevention.trace.map((item, index) => <li key={`${item}-${index}`}><span>{index + 1}</span>{item}</li>)}</ol>
            </div>
            <div className="result-candidates">
              <strong>候选药物</strong>
              {candidates.length ? candidates.map((drug) => (
                <div key={drug.name}><span>{drug.name}</span><b>{drug.rank}</b>{drug.offLabel ? <small>超说明书</small> : null}</div>
              )) : <p>当前无候选药物输出</p>}
            </div>
            <div className="result-demographics">
              <div><span>年龄</span><strong>{ageValue} {ageUnit === "years" ? "岁" : "个月"}</strong></div>
              <div><span>体重</span><strong>{weightKg} kg</strong></div>
              <div><span>身高</span><strong>{heightCm} cm</strong></div>
            </div>
            <button className="copy-button" type="button" onClick={copySummary}>{copyState}</button>
            <small className="result-disclaimer">所有输出均依据当前项目规则版本生成，请由专业人员结合患者实际情况复核。</small>
          </aside>
        </div>
      </section>

      <footer>
        <div><strong>Antifungal Compass</strong><p>开源规则演示项目 · 不收集或上传患儿数据</p></div>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
