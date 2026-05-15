import type { Metadata } from 'next';
import SalaryPageClient from './SalaryPageClient';

export const metadata: Metadata = {
  title: '工资结构改造工具 | HR 工具',
  description: '将固定月薪改造为「底薪 + 岗位津贴 + 加班费」三段式结构，支持节假日日历、月度计算和年度汇总导出。',
};

export default function SalaryPage() {
  return <SalaryPageClient />;
}
