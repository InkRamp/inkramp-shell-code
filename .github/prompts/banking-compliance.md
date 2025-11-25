# Banking Compliance Checklist

Use this prompt when implementing features that handle sensitive banking data.

## Compliance Areas

### PCI DSS (Payment Card Industry Data Security Standard)
- [ ] Card numbers masked (show only last 4 digits)
- [ ] CVV never stored or displayed after validation
- [ ] Secure transmission (HTTPS only)
- [ ] Access logging enabled

### GDPR (General Data Protection Regulation)
- [ ] User consent obtained before data collection
- [ ] Right to access: User can view their data
- [ ] Right to erasure: User can request deletion
- [ ] Data minimization: Only collect necessary data

### Audit Trail Requirements
- [ ] All critical actions logged
- [ ] Logs include: timestamp, user, action, affected entity
- [ ] Logs stored securely and immutably
- [ ] Retention policy followed

## Prompt Template

```
I'm implementing [FEATURE_NAME] that handles [DATA_TYPE]. 

Please review for banking compliance:

1. **Data Classification**:
   - PII involved: [yes/no - list if yes]
   - Financial data: [yes/no - type]
   - Card data: [yes/no]

2. **Current Implementation**:
   [Paste relevant code or describe approach]

3. **Questions**:
   - Is sensitive data properly masked in UI?
   - Are there any logging statements that expose PII?
   - Is the data transmitted securely?
   - Are proper access controls in place?
   - Is there an audit trail for changes?

4. **Compliance Targets**:
   - [ ] PCI DSS
   - [ ] GDPR
   - [ ] SOX
   - [ ] Local banking regulations

Please identify any compliance issues and suggest fixes.
```

## Example Usage

```
I'm implementing TransactionHistoryComponent that handles account transactions.

Please review for banking compliance:

1. **Data Classification**:
   - PII involved: Yes - account holder name, account number
   - Financial data: Yes - transaction amounts, balances
   - Card data: No

2. **Current Implementation**:
   - Displaying full account numbers in table
   - Logging transaction data to console for debugging
   - Data fetched via HTTP from BFF

3. **Questions**:
   - Is sensitive data properly masked in UI?
   - Are there any logging statements that expose PII?
   - Is the data transmitted securely?
   - Are proper access controls in place?
   - Is there an audit trail for changes?

4. **Compliance Targets**:
   - [x] PCI DSS
   - [x] GDPR
   - [ ] SOX
   - [x] Local banking regulations

Please identify any compliance issues and suggest fixes.
```

## Common Issues & Fixes

### Issue: Full account numbers displayed
```typescript
// ❌ Bad
<td>{{ transaction.accountNumber }}</td>

// ✅ Good
<td>{{ transaction.accountNumber | maskAccountNumber }}</td>
// Shows: ****1234
```

### Issue: Sensitive data in console logs
```typescript
// ❌ Bad
console.log('Transaction data:', transaction);

// ✅ Good
console.log('Transaction ID:', transaction.id, 'Status:', transaction.status);
// Or use structured logging that redacts sensitive fields
```

### Issue: No audit trail
```typescript
// ✅ Good - emit audit event
this.eventBus.emit('audit:action', {
  action: 'TRANSACTION_VIEWED',
  entityType: 'Transaction',
  entityId: transaction.id,
  timestamp: new Date().toISOString(),
  userId: this.authService.currentUser?.id
});
```
