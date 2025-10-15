import { TestBed } from '@angular/core/testing';
import { DummyDataService } from './dummy-data.service';

describe('DummyDataService', () => {
  let service: DummyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DummyDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate sales executives', () => {
    const executives = service.getSalesExecutives();
    expect(executives.length).toBeGreaterThan(0);
    expect(executives[0]).toHaveProperty('id');
    expect(executives[0]).toHaveProperty('name');
    expect(executives[0]).toHaveProperty('email');
  });

  it('should generate incentive rules', () => {
    const rules = service.getIncentiveRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0]).toHaveProperty('id');
    expect(rules[0]).toHaveProperty('name');
    expect(rules[0]).toHaveProperty('type');
  });

  it('should get sales records for specific executive', () => {
    const executives = service.getSalesExecutives();
    const executiveId = executives[0].id;
    
    const salesRecords = service.getSalesRecordsForExecutive(executiveId);
    
    salesRecords.forEach(record => {
      expect(record.salesExecutiveId).toBe(executiveId);
    });
  });

  it('should get incentives for specific executive', () => {
    const executives = service.getSalesExecutives();
    const executiveId = executives[0].id;
    
    const incentives = service.getIncentivesForExecutive(executiveId);
    
    incentives.forEach(incentive => {
      expect(incentive.salesExecutiveId).toBe(executiveId);
    });
  });

  it('should generate report data for executive', () => {
    const executives = service.getSalesExecutives();
    const executiveId = executives[0].id;
    
    const reportData = service.getReportDataForExecutive(executiveId);
    
    expect(reportData).toHaveProperty('salesExecutiveId');
    expect(reportData).toHaveProperty('totalSales');
    expect(reportData).toHaveProperty('totalIncentives');
    expect(reportData).toHaveProperty('breakdown');
    expect(reportData.breakdown.length).toBe(6); // 6 months
  });

  it('should add new incentive rule', () => {
    const initialRules = service.getIncentiveRules();
    const initialCount = initialRules.length;
    
    const newRule = {
      id: 'test-rule',
      name: 'Test Rule',
      description: 'Test Description',
      type: 'percentage' as const,
      value: 10,
      isActive: true,
      createdBy: 'test-user',
      createdAt: new Date()
    };
    
    service.addIncentiveRule(newRule);
    
    const updatedRules = service.getIncentiveRules();
    expect(updatedRules.length).toBe(initialCount + 1);
    expect(updatedRules[updatedRules.length - 1].id).toBe('test-rule');
  });

  it('should update incentive rule', () => {
    const rules = service.getIncentiveRules();
    const ruleToUpdate = rules[0];
    
    service.updateIncentiveRule(ruleToUpdate.id, { value: 99 });
    
    const updatedRules = service.getIncentiveRules();
    const updatedRule = updatedRules.find(r => r.id === ruleToUpdate.id);
    
    expect(updatedRule?.value).toBe(99);
  });

  it('should delete incentive rule', () => {
    const initialRules = service.getIncentiveRules();
    const ruleToDelete = initialRules[0];
    
    service.deleteIncentiveRule(ruleToDelete.id);
    
    const updatedRules = service.getIncentiveRules();
    expect(updatedRules.find(r => r.id === ruleToDelete.id)).toBeUndefined();
    expect(updatedRules.length).toBe(initialRules.length - 1);
  });
});
