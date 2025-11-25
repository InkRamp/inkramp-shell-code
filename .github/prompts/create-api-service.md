# Create New API Service

Use this prompt when you need to create a new API service in core-services.

## Required Context
- Service name and domain
- API endpoints it will consume
- Data types/interfaces

## Prompt Template

```
Create a new API service in @org/core-services for [DOMAIN_NAME] that:

1. **Service Name**: [ServiceName]Service

2. **Endpoints**:
   - GET [endpoint]: [description]
   - POST [endpoint]: [description]
   - PUT [endpoint]: [description]
   - DELETE [endpoint]: [description]

3. **Data Types**:
   ```typescript
   interface [Entity] {
     // Define properties
   }
   ```

4. **Requirements**:
   - Use the centralized API_CONFIG.baseUrl
   - Include proper error handling with catchError
   - Add JSDoc comments for all public methods
   - Follow the pattern of existing services (IncentivesService)

5. **Caching** (if applicable):
   - Cache GET requests for [duration]
   - Invalidate cache on mutations
```

## Example Usage

```
Create a new API service in @org/core-services for Transactions that:

1. **Service Name**: TransactionsService

2. **Endpoints**:
   - GET /transactions: List all transactions with pagination
   - GET /transactions/:id: Get transaction details
   - POST /transactions: Create new transaction
   - PUT /transactions/:id/status: Update transaction status

3. **Data Types**:
   ```typescript
   interface Transaction {
     id: string;
     amount: number;
     currency: string;
     status: 'pending' | 'completed' | 'failed';
     createdAt: Date;
     description?: string;
   }
   
   interface TransactionListParams {
     page: number;
     limit: number;
     status?: string;
     dateFrom?: string;
     dateTo?: string;
   }
   ```

4. **Requirements**:
   - Use the centralized API_CONFIG.baseUrl
   - Include proper error handling with catchError
   - Add JSDoc comments for all public methods
   - Follow the pattern of existing services (IncentivesService)

5. **Caching**:
   - Cache GET list requests for 30 seconds
   - Invalidate cache on create/update
```
