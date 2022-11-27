export interface IEnvironmentVariables {
  PORT: number;
  MONGO_URI: string;
  JWT_TOKEN_SECRET: string;
  SEND_GRID_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  S3_BUCKET_NAME: string;
  AWS_REGION: string;
  S3_URL: string;
}
