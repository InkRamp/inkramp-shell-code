# InkRamp Shell


## Step 1: Download the code using git clone

## Step 2: Make following changes
### Local Development
1. Set `"baseHref": "./"` in angular.json
2. Run `npm run watch:prod` in one terminal
3. Run `npx http-server dist/shell` in another terminal
4. Update `REDIRECT_URI` in auth.service.ts to `http://127.0.0.1:8080/`

## Step 3: Run the code
Run locally:

```bash
npm install
npm start
```

Open:

```text
http://localhost:4100
```
