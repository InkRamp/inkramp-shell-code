/**
 * Dummy data models for the incentive management system
 */

/**
 * Sales record for a sales executive. Right now exported from sales-data.service.ts
 */
// export interface SalesRecord {
//   id: string;
//   salesExecutiveId: string;
//   salesExecutiveName: string;
//   date: Date;
//   productName: string;
//   amount: number;
//   quantity: number;
//   status: 'completed' | 'pending' | 'cancelled';
// }

/**
 * Incentive rule definition
 */
export interface IncentiveRule {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number; // Percentage or fixed amount
  minSalesAmount?: number;
  maxSalesAmount?: number;
  productCategory?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

/**
 * Incentive earned by a sales executive
 */
export interface IncentiveEarned {
  id: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  ruleId: string;
  ruleName: string;
  salesRecordId: string;
  amount: number;
  earnedDate: Date;
  status: 'pending' | 'approved' | 'paid';
}

/**
 * Report data for charts
 */
export interface ReportData {
  salesExecutiveId: string;
  salesExecutiveName: string;
  totalSales: number;
  totalIncentives: number;
  period: string;
  breakdown: {
    month: string;
    sales: number;
    incentives: number;
  }[];
}

/**
 * Sales Executive for selection
 */
export interface SalesExecutive {
  id: string;
  name: string;
  email: string;
  teamId?: string;
}
