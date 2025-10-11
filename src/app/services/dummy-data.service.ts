import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  SalesRecord, 
  IncentiveRule, 
  IncentiveEarned, 
  ReportData, 
  SalesExecutive 
} from '../models/data.model';

/**
 * Shared dummy data service for all MFEs
 * Centralized data management for development and testing
 */
@Injectable({
  providedIn: 'root'
})
export class DummyDataService {
  private salesExecutivesSubject = new BehaviorSubject<SalesExecutive[]>(this.generateSalesExecutives());
  public salesExecutives$: Observable<SalesExecutive[]> = this.salesExecutivesSubject.asObservable();

  private salesRecordsSubject = new BehaviorSubject<SalesRecord[]>(this.generateSalesRecords());
  public salesRecords$: Observable<SalesRecord[]> = this.salesRecordsSubject.asObservable();

  private incentiveRulesSubject = new BehaviorSubject<IncentiveRule[]>(this.generateIncentiveRules());
  public incentiveRules$: Observable<IncentiveRule[]> = this.incentiveRulesSubject.asObservable();

  private incentivesEarnedSubject = new BehaviorSubject<IncentiveEarned[]>(this.generateIncentivesEarned());
  public incentivesEarned$: Observable<IncentiveEarned[]> = this.incentivesEarnedSubject.asObservable();

  constructor() {}

  /**
   * Generate dummy sales executives
   */
  private generateSalesExecutives(): SalesExecutive[] {
    return [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', teamId: 'team1' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', teamId: 'team1' },
      { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', teamId: 'team2' },
      { id: '4', name: 'Alice Williams', email: 'alice.williams@example.com', teamId: 'team2' },
      { id: '5', name: 'Charlie Brown', email: 'charlie.brown@example.com', teamId: 'team1' }
    ];
  }

  /**
   * Generate dummy sales records
   */
  private generateSalesRecords(): SalesRecord[] {
    const records: SalesRecord[] = [];
    const executives = this.generateSalesExecutives();
    const products = ['Product A', 'Product B', 'Product C', 'Product D'];
    const statuses: Array<'completed' | 'pending' | 'cancelled'> = ['completed', 'pending', 'cancelled'];

    for (let i = 0; i < 50; i++) {
      const exec = executives[i % executives.length];
      const monthsAgo = Math.floor(i / 10);
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);

      records.push({
        id: `sale-${i + 1}`,
        salesExecutiveId: exec.id,
        salesExecutiveName: exec.name,
        date: date,
        productName: products[i % products.length],
        amount: Math.floor(Math.random() * 50000) + 10000,
        quantity: Math.floor(Math.random() * 10) + 1,
        status: statuses[i % 3]
      });
    }

    return records;
  }

  /**
   * Generate dummy incentive rules
   */
  private generateIncentiveRules(): IncentiveRule[] {
    return [
      {
        id: 'rule-1',
        name: 'Basic Sales Incentive',
        description: '5% incentive on all sales',
        type: 'percentage',
        value: 5,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'rule-2',
        name: 'High Value Sales Bonus',
        description: '10% incentive on sales above $50,000',
        type: 'percentage',
        value: 10,
        minSalesAmount: 50000,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date('2024-02-01')
      },
      {
        id: 'rule-3',
        name: 'Product A Special',
        description: 'Fixed $500 bonus for Product A sales',
        type: 'fixed',
        value: 500,
        productCategory: 'Product A',
        isActive: true,
        createdBy: 'team-lead-1',
        createdAt: new Date('2024-03-01')
      },
      {
        id: 'rule-4',
        name: 'Tiered Volume Incentive',
        description: '15% incentive on sales above $100,000',
        type: 'tiered',
        value: 15,
        minSalesAmount: 100000,
        isActive: false,
        createdBy: 'admin',
        createdAt: new Date('2024-04-01')
      }
    ];
  }

  /**
   * Generate dummy incentives earned
   */
  private generateIncentivesEarned(): IncentiveEarned[] {
    const incentives: IncentiveEarned[] = [];
    const executives = this.generateSalesExecutives();
    const rules = this.generateIncentiveRules();
    const statuses: Array<'pending' | 'approved' | 'paid'> = ['pending', 'approved', 'paid'];

    for (let i = 0; i < 30; i++) {
      const exec = executives[i % executives.length];
      const rule = rules[i % rules.length];
      const monthsAgo = Math.floor(i / 10);
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);

      incentives.push({
        id: `incentive-${i + 1}`,
        salesExecutiveId: exec.id,
        salesExecutiveName: exec.name,
        ruleId: rule.id,
        ruleName: rule.name,
        salesRecordId: `sale-${i + 1}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        earnedDate: date,
        status: statuses[i % 3]
      });
    }

    return incentives;
  }

  /**
   * Get sales records for a specific sales executive
   * @param salesExecutiveId ID of the sales executive
   * @returns Filtered sales records
   */
  getSalesRecordsForExecutive(salesExecutiveId: string): SalesRecord[] {
    return this.salesRecordsSubject.value.filter(
      record => record.salesExecutiveId === salesExecutiveId
    );
  }

  /**
   * Get incentives earned for a specific sales executive
   * @param salesExecutiveId ID of the sales executive
   * @returns Filtered incentives
   */
  getIncentivesForExecutive(salesExecutiveId: string): IncentiveEarned[] {
    return this.incentivesEarnedSubject.value.filter(
      incentive => incentive.salesExecutiveId === salesExecutiveId
    );
  }

  /**
   * Get report data for a specific sales executive
   * @param salesExecutiveId ID of the sales executive
   * @returns Report data with breakdown
   */
  getReportDataForExecutive(salesExecutiveId: string): ReportData {
    const exec = this.salesExecutivesSubject.value.find(e => e.id === salesExecutiveId);
    const salesRecords = this.getSalesRecordsForExecutive(salesExecutiveId);
    const incentives = this.getIncentivesForExecutive(salesExecutiveId);

    const totalSales = salesRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalIncentives = incentives
      .filter(i => i.status !== 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    // Generate monthly breakdown for last 6 months
    const breakdown: ReportData['breakdown'] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);

      const monthSales = salesRecords
        .filter(r => r.date.toISOString().substring(0, 7) === monthKey && r.status === 'completed')
        .reduce((sum, r) => sum + r.amount, 0);

      const monthIncentives = incentives
        .filter(i => i.earnedDate.toISOString().substring(0, 7) === monthKey && i.status !== 'pending')
        .reduce((sum, i) => sum + i.amount, 0);

      breakdown.push({
        month: monthKey,
        sales: monthSales,
        incentives: monthIncentives
      });
    }

    return {
      salesExecutiveId,
      salesExecutiveName: exec?.name || 'Unknown',
      totalSales,
      totalIncentives,
      period: 'Last 6 months',
      breakdown
    };
  }

  /**
   * Get all sales executives
   * @returns List of sales executives
   */
  getSalesExecutives(): SalesExecutive[] {
    return this.salesExecutivesSubject.value;
  }

  /**
   * Get all incentive rules
   * @returns List of incentive rules
   */
  getIncentiveRules(): IncentiveRule[] {
    return this.incentiveRulesSubject.value;
  }

  /**
   * Add a new incentive rule
   * @param rule Incentive rule to add
   */
  addIncentiveRule(rule: IncentiveRule): void {
    const currentRules = this.incentiveRulesSubject.value;
    this.incentiveRulesSubject.next([...currentRules, rule]);
  }

  /**
   * Update an existing incentive rule
   * @param ruleId ID of the rule to update
   * @param updates Partial rule updates
   */
  updateIncentiveRule(ruleId: string, updates: Partial<IncentiveRule>): void {
    const currentRules = this.incentiveRulesSubject.value;
    const updatedRules = currentRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    this.incentiveRulesSubject.next(updatedRules);
  }

  /**
   * Delete an incentive rule
   * @param ruleId ID of the rule to delete
   */
  deleteIncentiveRule(ruleId: string): void {
    const currentRules = this.incentiveRulesSubject.value;
    const filteredRules = currentRules.filter(rule => rule.id !== ruleId);
    this.incentiveRulesSubject.next(filteredRules);
  }
}
