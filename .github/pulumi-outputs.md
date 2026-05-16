# InkRamp — Pulumi Stack Outputs  

> **Environment:** `prod`  
> **Stack:** `inkramp/prod`  
> **Region:** `us-east-1`  
> **Account:** `668918190458`
>
> Update this file whenever `pulumi stack output` changes.  
> **When to use this file vs SSM:** Use this file for development context, debugging, and code-review reference only. Application code (Lambda handlers, frontend config) must always read values from SSM Parameter Store or environment variables injected at deploy time — never from this file at runtime.

---

## API Gateway

| Key | Value |
|---|---|
| `apiEndpoint` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com` |
| `apiEndpointsUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs/endpoints.json` |
| `openApiSpecUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs/openapi.yaml` |
| `swaggerUiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs` |

## WebSocket API

| Key | Value |
|---|---|
| `wsApiUrl` | `wss://8g4vpxfis8.execute-api.us-east-1.amazonaws.com/v1` |
| `aiStreamApiUrl` | `wss://8g4vpxfis8.execute-api.us-east-1.amazonaws.com/v1` |

## Service API URLs

| Key | Value |
|---|---|
| `identityApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1` |
| `catalogApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/catalog` |
| `rfqApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs` |
| `quotingApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs` |
| `documentsApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/documents` |
| `analyticsApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/analytics` |
| `aiPlatformApiUrl` | `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/ai` |

## Lambda Function Names

| Key | Value |
|---|---|
| `identityLambdaName` | `inkramp-identity` |
| `catalogLambdaName` | `inkramp-catalog` |
| `rfqLambdaName` | `inkramp-rfq` |
| `quotingLambdaName` | `inkramp-quoting` |
| `documentsLambdaName` | `inkramp-documents` |
| `analyticsLambdaName` | `inkramp-analytics` |
| `aiPlatformLambdaName` | `inkramp-ai-platform` |

## Step Functions

| Key | Value |
|---|---|
| `documentsWorkflowArn` | `arn:aws:states:us-east-1:668918190458:stateMachine:inkramp-document-processor-prod` |
| `aiAgentWorkflowArn` | `arn:aws:states:us-east-1:668918190458:stateMachine:inkramp-ai-agent-prod` |

## SQS Queues

| Key | Value |
|---|---|
| `documentsQueueUrl` | `https://sqs.us-east-1.amazonaws.com/668918190458/inkramp-documents-queue-prod` |
| `aiJobsQueueUrl` | `https://sqs.us-east-1.amazonaws.com/668918190458/inkramp-ai-jobs-queue-prod` |

## EventBridge

| Key | Value |
|---|---|
| `domainEventsBusName` | `inkramp-domain-events-prod` |

## S3

| Key | Value |
|---|---|
| `documentsBucketName` | `inkramp-documents-prod` |

---

## Raw `pulumi stack output` dump

```
Outputs:
    outputs: {
        aiAgentWorkflowArn  : "arn:aws:states:us-east-1:668918190458:stateMachine:inkramp-ai-agent-prod"
        aiJobsQueueUrl      : "https://sqs.us-east-1.amazonaws.com/668918190458/inkramp-ai-jobs-queue-prod"
        aiPlatformApiUrl    : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/ai"
        aiPlatformLambdaName: "inkramp-ai-platform"
        aiStreamApiUrl      : "wss://8g4vpxfis8.execute-api.us-east-1.amazonaws.com/v1"
        analyticsApiUrl     : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/analytics"
        analyticsLambdaName : "inkramp-analytics"
        apiEndpoint         : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com"
        apiEndpointsUrl     : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs/endpoints.json"
        catalogApiUrl       : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/catalog"
        catalogLambdaName   : "inkramp-catalog"
        documentsApiUrl     : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/documents"
        documentsBucketName : "inkramp-documents-prod"
        documentsLambdaName : "inkramp-documents"
        documentsQueueUrl   : "https://sqs.us-east-1.amazonaws.com/668918190458/inkramp-documents-queue-prod"
        documentsWorkflowArn: "arn:aws:states:us-east-1:668918190458:stateMachine:inkramp-document-processor-prod"
        domainEventsBusName : "inkramp-domain-events-prod"
        identityApiUrl      : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1"
        identityLambdaName  : "inkramp-identity"
        openApiSpecUrl      : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs/openapi.yaml"
        quotingApiUrl       : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs"
        quotingLambdaName   : "inkramp-quoting"
        rfqApiUrl           : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs"
        rfqLambdaName       : "inkramp-rfq"
        swaggerUiUrl        : "https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/docs"
        wsApiUrl            : "wss://8g4vpxfis8.execute-api.us-east-1.amazonaws.com/v1"
    }
```
