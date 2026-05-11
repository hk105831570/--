"use client";

import type { BasicInfo, DiagnosisSession } from "@/types/risk";

const BASIC_INFO_KEY = "labor-risk-basic-info";
const DIAGNOSIS_KEY = "labor-risk-diagnosis-session";
const USER_ROLE_KEY = "userRole";

export function saveBasicInfo(info: BasicInfo) {
  localStorage.setItem(BASIC_INFO_KEY, JSON.stringify(info));
}

export function getBasicInfo(): BasicInfo | null {
  const raw = localStorage.getItem(BASIC_INFO_KEY);
  return raw ? (JSON.parse(raw) as BasicInfo) : null;
}

export function saveDiagnosis(session: DiagnosisSession) {
  localStorage.setItem(DIAGNOSIS_KEY, JSON.stringify(session));
}

export function getDiagnosis(): DiagnosisSession | null {
  const raw = localStorage.getItem(DIAGNOSIS_KEY);
  return raw ? (JSON.parse(raw) as DiagnosisSession) : null;
}

export function saveUserRole(role: "employer" | "employee") {
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function getUserRole(): "employer" | "employee" {
  return (localStorage.getItem(USER_ROLE_KEY) as "employer" | "employee") || "employer";
}

export function clearDiagnosis() {
  localStorage.removeItem(DIAGNOSIS_KEY);
  localStorage.removeItem(BASIC_INFO_KEY);
}
