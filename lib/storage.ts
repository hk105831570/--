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

const CASE_ID_KEY = "labor-risk-case-id";
const PAYMENT_KEY = "labor-risk-payment-verified";
const ACCESS_TOKEN_KEY = "labor-risk-access-token";
const SHARE_TRACK_KEY = "labor-risk-share-tracking";

export interface ShareTracking {
  fromShare: boolean;
  shareScene: string;
  shareRole: string;
  shareLevel: string;
  landingTime: string;
}

export function saveShareTracking(info: ShareTracking) {
  localStorage.setItem(SHARE_TRACK_KEY, JSON.stringify(info));
}

export function getShareTracking(): ShareTracking | null {
  const raw = localStorage.getItem(SHARE_TRACK_KEY);
  return raw ? (JSON.parse(raw) as ShareTracking) : null;
}

export function clearDiagnosis() {
  localStorage.removeItem(DIAGNOSIS_KEY);
  localStorage.removeItem(BASIC_INFO_KEY);
}

export function saveCaseId(id: string) {
  localStorage.setItem(CASE_ID_KEY, id);
}

export function getCaseId(): string | null {
  return localStorage.getItem(CASE_ID_KEY);
}

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function markPaymentVerified() {
  localStorage.setItem(PAYMENT_KEY, "true");
}

export function isPaymentVerified(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PAYMENT_KEY) === "true";
}

export function clearPaymentStatus() {
  localStorage.removeItem(PAYMENT_KEY);
}
