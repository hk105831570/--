'use client';
import dynamic from 'next/dynamic';

const SalaryTool = dynamic(() => import('@/components/salary/SalaryTool'), { ssr: false });

export default function SalaryPageClient() {
  return <SalaryTool />;
}
