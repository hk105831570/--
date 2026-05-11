import type { Scene } from "@/types/risk";

export const scenes: Scene[] = [
  { id: "probation-termination", title: "试用期解除争议", description: "员工表现不符合预期，企业是否具备解除依据？", employeeDesc: "公司说我试用期不合格要辞退，这样合法吗？我有权拿赔偿吗？", status: "available" },
  { id: "disciplinary-dispute", title: "员工违纪处理争议", description: "员工存在违纪行为，制度依据和证据是否足够？", employeeDesc: "公司以违纪为由辞退我，但我觉得处罚不合理，我该怎么办？", status: "available" },
  { id: "performance-dispute", title: "绩效不达标处理争议", description: "员工长期不能胜任，企业是否具备培训、调岗或进一步处理路径？", employeeDesc: "公司说我绩效不合格要辞退，但从没给过我培训机会，合理吗？", status: "available" },
  { id: "job-salary-adjustment", title: "调岗降薪争议", description: "岗位或薪酬调整是否具备合理性、协商记录和制度依据？", employeeDesc: "公司强行调岗降薪，我没有同意，这样合法吗？", status: "available" },
  { id: "overtime-pay", title: "加班费争议", description: "员工主张加班费，考勤、审批和工作安排证据是否能支撑企业抗辩？", employeeDesc: "我长期加班但公司不给加班费，我能追回多少？", status: "available" },
  { id: "departure-compensation", title: "离职补偿争议", description: "员工离职后要求经济补偿，企业是否存在支付义务？", employeeDesc: "我被公司辞退，他们说不用赔钱，真的吗？", status: "available" }
];

export const getSceneById = (id: string) => scenes.find((scene) => scene.id === id);
