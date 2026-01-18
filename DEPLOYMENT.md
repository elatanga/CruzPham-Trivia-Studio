# CruzPham Trivia: Production Deployment & Domain Strategy

## 1. Domain Mapping: cruzphamtriviastudio.it
To point your custom domain to the production studio:

1.  **Firebase Console**: Navigate to **Hosting** > **Add Custom Domain**.
2.  **Domain Input**: Enter `cruzphamtriviastudio.it`.
3.  **DNS Verification**:
    - Firebase will generate a **TXT record**. Log into your domain registrar (e.g., Aruba, Cloudflare, Namecheap) and add this record to verify ownership.
    - Once verified, Firebase will provide **A records** (IP addresses).
    - Update your DNS settings to include these A records.
4.  **SSL Provisioning**: 
    - Firebase automatically provisions a **Let's Encrypt SSL certificate**.
    - This process starts as soon as your DNS records propagate (usually 1–24 hours).
    - No manual certificate management is required.

## 2. Infrastructure Setup (Google Cloud)
### Firebase Strategy
- **Project ID**: `cruzpham-trivia-prod`
- **Location**: Choose a region closest to your main audience (e.g., `europe-west1` for `.it` domains).
- **Security**: 
    - Ensure `firestore.rules` are deployed to prevent unauthorized data access.
    - Enable **App Check** in production to protect your Gemini API usage and Firestore quotas.

## 3. Containerization (Cloud Run)
If you prefer Cloud Run over Firebase Hosting for full container control:
1.  Build the image: `docker build -t gcr.io/cruzpham-trivia-prod/studio:v1 .`
2.  Push to Artifact Registry: `docker push gcr.io/cruzpham-trivia-prod/studio:v1`
3.  Deploy to Cloud Run:
    ```bash
    gcloud run deploy studio \
      --image gcr.io/cruzpham-trivia-prod/studio:v1 \
      --region europe-west1 \
      --allow-unauthenticated \
      --set-env-vars API_KEY=YOUR_PROD_GEMINI_KEY
    ```

## 4. Environment Variables
- **Development**: Use `.env.local`
- **Production (Firebase)**: Use `firebase functions:config:set` (if using SSR) or build-time injection for the SPA.
- **Production (Cloud Run)**: Use Secret Manager or environment variables in the Cloud Run service configuration.

## 5. Performance Monitoring
- Enable **Firebase Performance Monitoring** to track the "Time to Interactive" for your board, ensuring zero-latency transitions during live TikTok broadcasts.
- Use **Google Cloud Error Reporting** to catch any silent failures in the Gemini reconstruction logic.