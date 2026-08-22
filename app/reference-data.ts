import type { DrugName, MedicationKey } from "./rules";

export const diagnosisOptions = [
  ["ALL", "�����ܰ�ϸ����Ѫ����ALL��"], ["AML", "������ϵ��Ѫ����AML��"],
  ["lymphoma", "�ܰ���"], ["MDS", "���������쳣�ۺ�����MDS��"],
  ["CML", "������ϸ����Ѫ����CML��"], ["other", "����"],
] as const;

export const additionalRiskFactors = [
  ["mucositis", "��ǻ��θ�����Ĥ��"],
  ["primary-immunodeficiency", "ԭ��������ȱ�ݲ�����������ѿ�ײ���������������ȱ�ݲ���X-������IgMѪ֢����IgE�ۺ����ȣ�"],
  ["severe-viral", "��֢������Ⱦ����CMV��EBV����֢������������Ⱦ�ȣ�"],
  ["lung-structure", "����������νṹ�쳣����������֧���ܷη����쳣��֧�������ŵȣ�"],
  ["diabetes", "���򲡻����ظ�Ѫ��״̬��������֢ͪ���ж��ȣ�"],
  ["qtc", "QTc�����ӳ�"],
] as const;

export const immuneTherapyOptions = [
  ["car-t", "CAR-Tϸ������"],
  ["b-cell", "Bϸ���������ƣ��������������������׵����ȣ�"],
  ["atg", "������ϸ���򵰰ף�ATG������"],
  ["checkpoint", "���߼������Ƽ����ƣ���PD-1/PD-L1���Ƽ��ȣ�"],
  ["immunomodulator", "���ߵ��ڼ����ƣ������ǶȰ��ȣ�"],
  ["small-molecule", "С���Ӱ���ҩ���BTK��BCL-2��BCR-ABL���Ƽ��ȣ�"],
  ["calcineurin-mtor", "�Ƶ�����ø���Ƽ�/mTOR���Ƽ�"],
  ["other", "����"],
] as const;

export const smallMoleculeOptions = [
  ["btk", "��������/������/���������BTK���Ƽ�"],
  ["venetoclax", "ά�ο���"],
  ["bcr-abl", "��������/��ɳ����/���������BCR-ABL���Ƽ�"],
  ["other", "����"],
] as const;

export const calcineurinMtorOptions = [
  ["cyclosporine", "������"], ["tacrolimus", "����Ī˾"], ["sirolimus", "����Ī˾"],
  ["everolimus", "��άĪ˾"], ["other", "����"],
] as const;

export const medicationGroups: { title: string; options: { key: MedicationKey; label: string }[] }[] = [
  {
    title: "���������뿹�������",
    options: [
      { key: "sirolimus", label: "����Ī˾" }, { key: "tacrolimus", label: "����Ī˾" },
      { key: "cyclosporine", label: "������" }, { key: "everolimus", label: "��άĪ˾" },
      { key: "venetoclax", label: "ά�ο���" }, { key: "vinca", label: "��������" },
      { key: "cyclophosphamide", label: "��������" }, { key: "anthracycline-imatinib", label: "���ù��/�������/��������/��������" },
    ],
  },
  {
    title: "Ӱ�쿹���ҩ��¶��ҩ��",
    options: [
      { key: "enzyme-inducer", label: "��ҩø�յ�����������ƽ��������ƽ�ȣ�" },
      { key: "phenytoin", label: "����Ӣ" }, { key: "rifabutin", label: "������͡" },
      { key: "macrolide", label: "����ù��/��ù��" }, { key: "ritonavir-high", label: "�߼���������Τ" },
      { key: "prednisone-pioglitazone", label: "�����ɻ�������ͪ" },
    ],
  },
  {
    title: "������˶Եĺϲ���ҩ",
    options: [
      { key: "qt-drugs", label: "��˾����/��ɳ����/���ᶡ" }, { key: "fluconazole", label: "������" },
      { key: "warfarin", label: "�����ֻ���������ҩ" }, { key: "benzodiazepine", label: "������?��" },
      { key: "statin", label: "��͡��" }, { key: "digoxin", label: "�ظ���" },
      { key: "omeprazole40", label: "���������40 mg/��" }, { key: "fentanyl", label: "��̫��/���̫��" },
      { key: "sulfonylurea", label: "�����ཱུ��ҩ" }, { key: "nifedipine", label: "������ƽ" },
      { key: "nephrotoxic", label: "���ù��/�����������������ҩ��" }, { key: "potassium-diuretic", label: "�ż������" },
    ],
  },
];

export type InteractionWarning = { label: string; text: string };
export type DrugReference = {
  drug: DrugName;
  administration: string[];
  precautions: string[];
  interactions: { medications: MedicationKey[]; label: string; text: string }[];
};

export const drugReferences: DrugReference[] = [
  {
    drug: "��ɳ����",
    administration: ["����ƬӦ�������ʣ�����������ѹ���׽���", "�ڷ�����ҺӦ�ڽ����ڼ��ͺ�������20�����ڣ����á�"],
    precautions: ["����Ƭ��ڷ�����Һ������ͬ���������Ͳ��ɻ���ʹ�á�"],
    interactions: [
      { medications: ["enzyme-inducer", "phenytoin", "rifabutin"], label: "��ҩø�յ���", text: "���������ڼ䲴ɳ����ѪҩŨ�ȿ������½������ǻ��泬�����գ�������������á�" },
      { medications: ["sirolimus"], label: "����Ī˾", text: "��ʼ��ɳ��������ʱ��������Ī˾������ǰ������Լ1/10����Ƶ�����ȫѪ��Ũ�ȡ�" },
      { medications: ["tacrolimus"], label: "����Ī˾", text: "��ɳ�����������������Ī˾ѪҩŨ�ȣ���ʼ��ɳ����ʱ��������Ī˾������ʼ������Լ1/3����Ƶ�����ȫѪ��Ũ�ȡ�" },
      { medications: ["statin"], label: "��͡��", text: "��ֹ����Ҫ��CYP3A4��л��HMG-CoA��ԭø���Ƽ�ͬʱʹ�ã�����ҩ��Ũ�����߲��������Ƽ��ܽ�֢��" },
      { medications: ["cyclosporine"], label: "������", text: "��ʼ��ɳ��������ʱ���������ؼ�����ʼ������Լ3/4����Ƶ�����ȫѪ��Ũ�ȡ�" },
      { medications: ["benzodiazepine"], label: "������?��", text: "������ǿ���ӳ��򾲴������ã��������м��Ѫ��Ũ�ȹ�����ز�����Ӧ��" },
      { medications: ["vinca"], label: "��������", text: "�����߳��������Ѫ��Ũ�ȣ������񾭶��Ժ��������ز�����Ӧ��" },
      { medications: ["digoxin"], label: "�ظ���", text: "�����ߵظ���ѪҩŨ�ȣ�������ظ���ѪҩŨ�ȡ�" },
      { medications: ["venetoclax"], label: "ά�ο���", text: "CLL/SLL������ά�ο�����ʼ��ҩ�ͼ��������׶ν�ֹ�ϲ���ɳ���򣬿������������ܽ��ۺ������ա�" },
    ],
  },
  {
    drug: "��������",
    administration: ["����2�C12���ͯ���ÿڷ��ɻ�������", "��Ĥ��ƬӦ�����ڷ�ǰ1Сʱ�򷹺�1Сʱ���á�", "ע���������ע�ٶ���첻����3 mg/kg/Сʱ��ÿƿ��ע1�C3Сʱ��"],
    precautions: ["����ǰ�������ڼ���Ѫ����ʣ��ͼء���þ��͸Ƶ�����Ӧ�������", "ע�������������ҩ��򳦵���Ӫ������ͬһ����ͨ·ͬʱ��ע��������4.2%̼��������Һϡ�͡�"],
    interactions: [
      { medications: ["qt-drugs"], label: "��˾����/��ɳ����/���ᶡ", text: "��ֹ���ã�ҩ��Ũ�����߿ɵ���QTc�ӳ�����ż�����Ťת�������Ķ����١�" },
      { medications: ["enzyme-inducer", "phenytoin", "rifabutin"], label: "��ҩø�յ���", text: "�����������ͷ�������ѪҩŨ�ȣ�����Ҫ����û��ض�ҩ��ļ����������鴦����" },
      { medications: ["venetoclax"], label: "ά�ο���", text: "��ά�ο�����ʼʹ�ü����������׶ν�ֹ���ã��ȶ����밴ά�ο����������������м�ⶾ�ԡ�" },
      { medications: ["everolimus"], label: "��άĪ˾", text: "���Ƽ����ã���Ϊ���������������������άĪ˾ѪҩŨ�ȡ�" },
      { medications: ["fluconazole"], label: "������", text: "����ʱ���������������ز�����Ӧ��" },
      { medications: ["warfarin"], label: "����ҩ", text: "�����ӳ���Ѫøԭʱ�䣻Ӧ���м����Ѫ���鲢�ݴ˵�������ҩ������" },
      { medications: ["benzodiazepine"], label: "������?��", text: "��������ҩ��Ũ�Ȳ��ӳ������ã�Ӧ���Ǽ��ٱ�����?�������" },
      { medications: ["sirolimus"], label: "����Ī˾", text: "��ֹ��������������Ī˾���á�" },
      { medications: ["cyclosporine"], label: "������", text: "��ʼ��������ʱ���齫�����ؼ������벢���ܼ��ѪҩŨ�ȣ�ͣ�÷�������������Ⲣ����ص������ؼ�����" },
      { medications: ["omeprazole40"], label: "��������", text: "ÿ�հ��������40 mgʱ����ʼ���÷��������齫��������������롣" },
      { medications: ["fentanyl"], label: "��̫��/���̫��", text: "Ӧ���Ǽ��������м��������Ƽ���Ƭ��ز�����Ӧ�����ʵ��ӳ�����ڡ�" },
      { medications: ["statin"], label: "��͡��", text: "�������߾�CYP3A4��л����͡Ũ�Ȳ����º��Ƽ��ܽ⣬Ӧ���Ǽ�����͡������" },
      { medications: ["sulfonylurea"], label: "������", text: "��������ҩ��Ũ�Ȳ������Ѫ�ǣ����м��Ѫ�ǲ����Ǽ��ٻ����������" },
      { medications: ["vinca"], label: "��������", text: "��������ҩ��Ũ�Ȳ������񾭶��ԣ�Ӧ���Ǽ��ٳ������������" },
    ],
  },
  {
    drug: "��������",
    administration: ["Ϊ�ﵽ������գ�Ӧ�ͺ�������ҩ��", "���Ҽ�Ӧ�����̷���"],
    precautions: ["������������ڷ�Һ��Ӧ����ʹ�á�"],
    interactions: [
      { medications: ["enzyme-inducer", "phenytoin", "rifabutin"], label: "CYP3AǿЧ�յ���", text: "�ή������������ǻ����������������öȣ���������ã�����ǰ2�ܼ�������Ӧ���⣻�������ʱ��⿹������ԣ���Ҫʱ�����������������" },
      { medications: ["macrolide"], label: "����ù��/��ù��", text: "�������������Ƽ�����Ӧ���������м��ҩ��������ǿ���ӳ�����Ҫʱ���ټ����������������Ũ�ȡ�" },
      { medications: ["qt-drugs", "benzodiazepine", "statin", "nifedipine"], label: "���ɺ���ҩ����", text: "���ᶡ���ض�������?�ࡢ��ͨ�����ͼ�����ɳ��������͡�Ȳ��ú��ã�ֱ����������ͣҩ��2�ܡ�" },
      { medications: ["everolimus"], label: "��άĪ˾��", text: "�����ڼ估ͣҩ��2��Ӧ���⣻���ɱ���ʱ������Ʒ�Ӧ�Ͳ�����Ӧ����Ҫʱ������ͣҩ�����ѪҩŨ�ȡ�" },
      { medications: ["digoxin", "vinca", "cyclosporine", "tacrolimus", "ritonavir-high", "prednisone-pioglitazone"], label: "�����м��ҩ����", text: "����ʱ���м��ҩ��������ǿ���ӳ���������Ӧ����Ҫʱ���ͼ������ʵ�ʱ���ѪҩŨ�ȡ�" },
    ],
  },
  {
    drug: "��ɳ����",
    administration: [],
    precautions: ["��δȷ��18������δ������ʹ�ñ�Ʒ�İ�ȫ�Լ���Ч����ͯʹ�����ڳ�˵������ҩ��"],
    interactions: [
      { medications: ["enzyme-inducer", "phenytoin", "rifabutin"], label: "��ҩø�յ���", text: "�����������Ͱ�ɳ����ѪҩŨ�ȣ���ֹ���á�" },
      { medications: ["prednisone-pioglitazone"], label: "������/������ͪ", text: "����ʹ��ɳ����Ѫ��ˮƽ�½�������Ǳ�ڻ�����ڷ��գ�����Ӧ������á�" },
      { medications: ["ritonavir-high"], label: "�߼���������Τ", text: "��ֹ���ã��߼���������Τ�����յ�CYP3A4/5�����Ͱ�ɳ����ѪҩŨ�ȡ�" },
      { medications: ["macrolide"], label: "����ù��", text: "���������ɳ�����������������Ӧ�������ӣ�Ӧ���á�" },
      { medications: ["cyclosporine", "sirolimus", "tacrolimus"], label: "������/����Ī˾/����Ī˾", text: "������Ҫ���Ѫ��ˮƽ���ʵ�����������" },
      { medications: ["statin"], label: "��͡��", text: "ҩ��Ũ�ȿ������ӣ���������͡����Ͳ�����Ӧ��" },
      { medications: ["cyclophosphamide"], label: "��������", text: "Ũ�ȿ��ܽ��ͣ����м����Ч���㣬��Ҫʱ���Ӽ�����" },
      { medications: ["vinca", "anthracycline-imatinib"], label: "������/�컷��/���������", text: "ҩ��Ũ�ȿ������ӣ����м�ⶾ�ԣ���Ҫʱ���ټ�����" },
      { medications: ["digoxin"], label: "�ظ���", text: "���Ѫ��ظ���Ũ�ȣ����ݴ˵����ظ���������" },
      { medications: ["benzodiazepine"], label: "������?��", text: "���м���ٴ�������֢״����������ټ�����" },
    ],
  },
  {
    drug: "�׿��Ҿ�",
    administration: ["������������Һ��������6Сʱ��Ӧ����Һ���ܹ⣻��Һ�ܲ����ڹ⡣"],
    precautions: ["��Ʒ�ڹ����¿ɻ����ֽ⣬Ӧ��������ֱ�䡣"],
    interactions: [
      { medications: ["sirolimus"], label: "����Ī˾", text: "�׿��Ҿ���ʹ����Ī˾ѪҩŨ������Լ21%�����������Ī˾���������ܼ��ѪҩŨ�ȡ�" },
      { medications: ["nifedipine"], label: "������ƽ", text: "������������ƽѪҩŨ�ȣ����Ѫѹ�����½����Ķ����ٵȲ�����Ӧ����Ҫʱ������" },
    ],
  },
  {
    drug: "�����Ҿ�",
    administration: ["Ӧ����������ע1Сʱ���ϡ�"],
    precautions: [],
    interactions: [
      { medications: ["cyclosporine"], label: "������", text: "���ÿɳ���ALT/AST�������ߣ������ڼ����ø�쳣���������������Ƶķ�������档" },
    ],
  },
  {
    drug: "֬��������ù��B",
    administration: ["Ӧ������ע30�C60���ӣ���������5 mg/kg/��ʱ�Ƽ���ע2Сʱ��"],
    precautions: ["Ӧ������ע1 mg���Լ���10���ӣ������ϸ�۲�30���ӡ�"],
    interactions: [
      { medications: ["cyclosporine", "tacrolimus", "nephrotoxic"], label: "������ҩ��", text: "���ÿ����������˷��գ�Ӧ�������⣻�������ʱ���ܼ�������ܡ�" },
      { medications: ["potassium-diuretic"], label: "�ż������", text: "�ɼ��ؼض�ʧ�������м��Ѫ�ز���ʱ���ء�" },
      { medications: ["digoxin"], label: "�ظ���", text: "����ù��B�շ��ĵͼؿ����ӵظ������Ժ�����ʧ�����գ������ܼ��Ѫ�ؼ��ĵ�ͼ��" },
    ],
  },
  {
    drug: "������",
    administration: [],
    precautions: ["��ǰ��Ŀ�ṩ�Ĳ�����û�е����ķ�����ҩ��ο�������ҳ������ȷ�����ּ��������"],
    interactions: [],
  },
];

export function getDrugReference(drug: DrugName) { return drugReferences.find((item) => item.drug === drug); }
export function getInteractionWarnings(drug: DrugName, medications: MedicationKey[]): InteractionWarning[] {
  const selected = new Set(medications);
  return (getDrugReference(drug)?.interactions ?? [])
    .filter((rule) => rule.medications.some((key) => selected.has(key)))
    .map(({ label, text }) => ({ label, text }));
}

export const tdmReference = [
  { drug: "��������", rows: [["TDMʱ��", "�Ƽ����濪չTDM"], ["�ٴ���Ч��Ũ��", "��1 mg/L"], ["�ٴ����Թ�Ũ��", "��4.5�C5.5 mg/L"], ["�״μ��", "��ҩ��3�C5��"]] },
  { drug: "��ɳ����", rows: [["TDMʱ��", "�ڷ�����Һ���ǳ��濪չ�����������ڼ������㡢�߷�����Ⱥ�п�չ"], ["�ٴ���Ч��Ũ��", "��0.5�C0.7 mg/L"], ["�ٴ����Թ�Ũ��", "��3.75 mg/L"], ["�״μ��", "��ҩ��7��"]] },
  { drug: "��������", rows: [["TDMʱ��", "�������Ƽ���չTDM"], ["�ٴ���Ч��Ũ��", "0.5�C4 mg/L"], ["�״μ��", "��ҩ��7��"]] },
  { drug: "��ɳ����", rows: [["TDMʱ��", "�������Ƽ����ڸι��ܲ�ȫ������ECMO���ơ���ͯ���ض������пɿ���̽�����о�"], ["�ٴ���Ч��Ũ��", "��2 mg/L"], ["�ٴ����Թ�Ũ��", "��5 mg/L"]] },
  { drug: "������", rows: [["TDMʱ��", "�������Ƽ�����������������ơ�ŧ��Ѫ֢���ض������пɿ���̽�����о�"]] },
  { drug: "���׾�����", rows: [["TDMʱ��", "�������Ƽ���Σ�ء��Ͱ׵���Ѫ֢������ECMO���ơ����ֵ��ض������пɿ���̽�����о�"]] },
  { drug: "�������", rows: [["TDMʱ��", "�Ƽ����濪չTDM"], ["�ٴ���Ч��Ũ��", "25�C40 mg/L"], ["�ٴ����Է�Ũ��", "��100 mg/L���ڷ���2Сʱ��������ҩ��30���ӣ�"], ["�״μ��", "��ҩ��3�C5��"]] },
  { drug: "����ù��B", rows: [["TDMʱ��", "���Ƽ�����TDM"]] },
];

