import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  SalesRecord, 
  IncentiveRule, 
  IncentiveEarned, 
  ReportData, 
  SalesExecutive 
} from './models/data.model';

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

  constructor() {
    // DEBUG_LOG: DummyDataService initialized
    console.log('[DummyDataService] Service initialized');
    console.log('[DummyDataService] Generated data:', {
      salesExecutives: this.salesExecutivesSubject.value.length,
      salesRecords: this.salesRecordsSubject.value.length,
      incentiveRules: this.incentiveRulesSubject.value.length,
      incentivesEarned: this.incentivesEarnedSubject.value.length
    });
  }

  /**
   * Generate dummy sales executives
   */
  private generateSalesExecutives(): SalesExecutive[] {
    // DEBUG_LOG: Generating sales executives
    console.log('[DummyDataService] Generating sales executives');
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
    // DEBUG_LOG: Generating sales records
    console.log('[DummyDataService] Generating sales records');
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
    // DEBUG_LOG: Generating incentive rules
    console.log('[DummyDataService] Generating incentive rules');
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
    // DEBUG_LOG: Generating incentives earned
    console.log('[DummyDataService] Generating incentives earned');
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
    // DEBUG_LOG: Fetching sales records for executive
    console.log('[DummyDataService] getSalesRecordsForExecutive() called for:', salesExecutiveId);
    const records = this.salesRecordsSubject.value.filter(
      record => record.salesExecutiveId === salesExecutiveId
    );
    // DEBUG_LOG: Records found
    console.log('[DummyDataService] Found', records.length, 'sales records for executive:', salesExecutiveId);
    return records;
  }

  /**
   * Get incentives earned for a specific sales executive
   * @param salesExecutiveId ID of the sales executive
   * @returns Filtered incentives
   */
  getIncentivesForExecutive(salesExecutiveId: string): IncentiveEarned[] {
    // DEBUG_LOG: Fetching incentives for executive
    console.log('[DummyDataService] getIncentivesForExecutive() called for:', salesExecutiveId);
    const incentives = this.incentivesEarnedSubject.value.filter(
      incentive => incentive.salesExecutiveId === salesExecutiveId
    );
    // DEBUG_LOG: Incentives found
    console.log('[DummyDataService] Found', incentives.length, 'incentives for executive:', salesExecutiveId);
    return incentives;
  }

  /**
   * Get report data for a specific sales executive
   * @param salesExecutiveId ID of the sales executive
   * @returns Report data with breakdown
   */
  getReportDataForExecutive(salesExecutiveId: string): ReportData {
    // DEBUG_LOG: Generating report data
    console.log('[DummyDataService] getReportDataForExecutive() called for:', salesExecutiveId);
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

    const reportData = {
      salesExecutiveId,
      salesExecutiveName: exec?.name || 'Unknown',
      totalSales,
      totalIncentives,
      period: 'Last 6 months',
      breakdown
    };

    // DEBUG_LOG: Report data generated
    console.log('[DummyDataService] Report data generated:', reportData);
    return reportData;
  }

  /**
   * Get all sales executives
   * @returns List of sales executives
   */
  getSalesExecutives(): SalesExecutive[] {
    const executives = this.salesExecutivesSubject.value;
    // DEBUG_LOG: Getting all sales executives
    console.log('[DummyDataService] getSalesExecutives() called, returning', executives.length, 'executives');
    return executives;
  }

  /**
   * Get all incentive rules
   * @returns List of incentive rules
   */
  getIncentiveRules(): IncentiveRule[] {
    const rules = this.incentiveRulesSubject.value;
    // DEBUG_LOG: Getting all incentive rules
    console.log('[DummyDataService] getIncentiveRules() called, returning', rules.length, 'rules');
    return rules;
  }

  /**
   * Add a new incentive rule
   * @param rule Incentive rule to add
   */
  addIncentiveRule(rule: IncentiveRule): void {
    // DEBUG_LOG: Adding new incentive rule
    console.log('[DummyDataService] addIncentiveRule() called with:', rule);
    const currentRules = this.incentiveRulesSubject.value;
    this.incentiveRulesSubject.next([...currentRules, rule]);
    // DEBUG_LOG: Rule added successfully
    console.log('[DummyDataService] Rule added successfully, total rules:', this.incentiveRulesSubject.value.length);
  }

  /**
   * Update an existing incentive rule
   * @param ruleId ID of the rule to update
   * @param updates Partial rule updates
   */
  updateIncentiveRule(ruleId: string, updates: Partial<IncentiveRule>): void {
    // DEBUG_LOG: Updating incentive rule
    console.log('[DummyDataService] updateIncentiveRule() called for rule:', ruleId, 'with updates:', updates);
    const currentRules = this.incentiveRulesSubject.value;
    const updatedRules = currentRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    this.incentiveRulesSubject.next(updatedRules);
    // DEBUG_LOG: Rule updated successfully
    console.log('[DummyDataService] Rule updated successfully');
  }

  /**
   * Delete an incentive rule
   * @param ruleId ID of the rule to delete
   */
  deleteIncentiveRule(ruleId: string): void {
    // DEBUG_LOG: Deleting incentive rule
    console.log('[DummyDataService] deleteIncentiveRule() called for rule:', ruleId);
    const currentRules = this.incentiveRulesSubject.value;
    const filteredRules = currentRules.filter(rule => rule.id !== ruleId);
    this.incentiveRulesSubject.next(filteredRules);
    // DEBUG_LOG: Rule deleted successfully
    console.log('[DummyDataService] Rule deleted successfully, remaining rules:', this.incentiveRulesSubject.value.length);
  }
}
