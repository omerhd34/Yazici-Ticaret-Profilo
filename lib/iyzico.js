import crypto from 'node:crypto';

/**
 * İyzico REST API Helper
 * Native Node.js ile iyzico API çağrıları yapar
 */
export class IyzicoClient {
 constructor(config) {
  this.apiKey = config.apiKey;
  this.secretKey = config.secretKey;
  this.uri = config.uri || 'https://sandbox-api.iyzipay.com';
 }

 /**
  * Random string oluştur
  */
 generateRandomString() {
  return crypto.randomBytes(16).toString('hex');
 }

 /**
  * Authorization header oluştur
  */
 generateAuthorizationHeader(url, requestBody) {
  const randomString = this.generateRandomString();
  const requestString = [
   randomString,
   this.apiKey,
   this.secretKey,
   JSON.stringify(requestBody)
  ].join('');

  const hash = crypto
   .createHmac('sha256', this.secretKey)
   .update(requestString)
   .digest('base64');

  return `IYZWS ${this.apiKey}:${hash}:${randomString}`;
 }

 /**
  * HTTP request gönder
  */
 async request(endpoint, body) {
  const url = `${this.uri}${endpoint}`;
  const authorization = this.generateAuthorizationHeader(url, body);

  try {
   const response = await fetch(url, {
    method: 'POST',
    headers: {
     'Accept': 'application/json',
     'Content-Type': 'application/json',
     'Authorization': authorization,
     'x-iyzi-client-version': 'node.js-1.0.0'
    },
    body: JSON.stringify(body)
   });

   const data = await response.json();
   return data;
  } catch (error) {
   console.error('İyzico API hatası:', error);
   throw error;
  }
 }

 /**
  * 3D Secure Initialize
  */
 async threedsInitialize(requestData) {
  return await this.request('/payment/3dsecure/initialize', requestData);
 }

 /**
  * 3D Secure Auth (Charge)
  */
 async threedsAuth(requestData) {
  return await this.request('/payment/3dsecure/auth', requestData);
 }

 /**
  * Ödeme sorgulama
  */
 async retrievePayment(requestData) {
  return await this.request('/payment/detail', requestData);
 }
}

/**
 * İyzico client instance oluştur
 */
export function createIyzicoClient() {
 const apiKey = process.env.IYZICO_API_KEY;
 const secretKey = process.env.IYZICO_SECRET_KEY;
 const uri = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com';

 if (!apiKey || !secretKey || apiKey === 'your_api_key_here' || secretKey === 'your_secret_key_here') {
  throw new Error('İyzico API anahtarları yapılandırılmamış');
 }

 return new IyzicoClient({
  apiKey,
  secretKey,
  uri
 });
}
