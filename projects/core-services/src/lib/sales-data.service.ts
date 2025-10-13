import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Sales record status
 */
export enum SalesStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

/**
 * Product category
 */
export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  SOFTWARE = 'Software',
  SERVICES = 'Services',
  HARDWARE = 'Hardware'
}

/**
 * Sales record interface
 */
export interface SalesRecord {
  id: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  productName: string;
  productCategory: ProductCategory;
  amount: number;
  commission: number;
  status: SalesStatus;
  date: Date;
  clientName: string;
  region: string;
}

/**
 * Sales summary interface
 */
export interface SalesSummary {
  totalSales: number;
  totalCommission: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

/**
 * Sales data service
 * Provides sales history data with filtering and summary capabilities
 * Uses dummy data for demonstration purposes
 * 
 * @Injectable providedIn: 'root' makes this service a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class SalesDataService {
  private dummySalesData: SalesRecord[] = this.generateDummyData();

  constructor() {}

  /**
   * Get sales records for a specific user
   * @param userId - User ID to filter sales records
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Observable of sales records
   */
  getSalesHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<SalesRecord[]> {
    let filtered = this.dummySalesData.filter(sale => sale.salesExecutiveId === userId);

    if (startDate) {
      filtered = filtered.filter(sale => sale.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(sale => sale.date <= endDate);
    }

    // Simulate API delay
    return of(filtered).pipe(delay(300));
  }

  /**
   * Get sales summary for a specific user
   * @param userId - User ID to get summary for
   * @returns Observable of sales summary
   */
  getSalesSummary(userId: string): Observable<SalesSummary> {
    const userSales = this.dummySalesData.filter(sale => sale.salesExecutiveId === userId);

    const summary: SalesSummary = {
      totalSales: userSales
        .filter(s => s.status === SalesStatus.COMPLETED)
        .reduce((sum, sale) => sum + sale.amount, 0),
      totalCommission: userSales
        .filter(s => s.status === SalesStatus.COMPLETED)
        .reduce((sum, sale) => sum + sale.commission, 0),
      completedCount: userSales.filter(s => s.status === SalesStatus.COMPLETED).length,
      pendingCount: userSales.filter(s => s.status === SalesStatus.PENDING).length,
      cancelledCount: userSales.filter(s => s.status === SalesStatus.CANCELLED).length
    };

    return of(summary).pipe(delay(300));
  }

  /**
   * Get all sales records (for admins/team leads)
   * @returns Observable of all sales records
   */
  getAllSales(): Observable<SalesRecord[]> {
    return of(this.dummySalesData).pipe(delay(300));
  }

  /**
   * Generate dummy sales data
   * This would be replaced with actual API calls in production
   * @returns Array of dummy sales records
   */
  private generateDummyData(): SalesRecord[] {
    const products = [
      { name: 'Enterprise Software License', category: ProductCategory.SOFTWARE, basePrice: 50000 },
      { name: 'Cloud Storage Solution', category: ProductCategory.SERVICES, basePrice: 25000 },
      { name: 'Server Hardware', category: ProductCategory.HARDWARE, basePrice: 35000 },
      { name: 'IoT Device Package', category: ProductCategory.ELECTRONICS, basePrice: 15000 },
      { name: 'Consulting Services', category: ProductCategory.SERVICES, basePrice: 20000 },
      { name: 'Mobile App Development', category: ProductCategory.SOFTWARE, basePrice: 45000 },
      { name: 'Security Suite', category: ProductCategory.SOFTWARE, basePrice: 30000 },
      { name: 'Network Infrastructure', category: ProductCategory.HARDWARE, basePrice: 60000 }
    ];

    const clients = [
      'Acme Corporation',
      'Tech Innovations Inc',
      'Global Solutions Ltd',
      'Digital Dynamics',
      'Future Systems',
      'Smart Technologies',
      'Enterprise Solutions',
      'Cloud Masters'
    ];

    const regions = ['North', 'South', 'East', 'West', 'Central'];

    const salesExecutives = [
      { id: 'user-4', name: 'Alice Sales' },
      { id: 'user-5', name: 'Bob Sales' },
      { id: 'user-6', name: 'Carol Sales' }
    ];

    const statuses = [
      SalesStatus.COMPLETED,
      SalesStatus.COMPLETED,
      SalesStatus.COMPLETED,
      SalesStatus.PENDING,
      SalesStatus.CANCELLED
    ];

    const records: SalesRecord[] = [];
    let idCounter = 1;

    // Generate 50 sales records
    for (let i = 0; i < 50; i++) {
      const exec = salesExecutives[i % salesExecutives.length];
      const product = products[Math.floor(Math.random() * products.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate random amount with some variance
      const amount = product.basePrice + (Math.random() * 10000 - 5000);
      const commission = amount * 0.05; // 5% commission

      // Generate date within last 6 months
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 180));

      records.push({
        id: `sale-${idCounter++}`,
        salesExecutiveId: exec.id,
        salesExecutiveName: exec.name,
        productName: product.name,
        productCategory: product.category,
        amount: Math.round(amount),
        commission: Math.round(commission),
        status,
        date,
        clientName: client,
        region
      });
    }

    // Sort by date descending (newest first)
    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
