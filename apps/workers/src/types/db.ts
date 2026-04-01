// type User = {
//   id: string;
//   email: string;
//   password?: string;
//   name?: string;
//   avatarUrl?: string;
//   googleId?: string;
//   domains: Domain[];
//   userPlan: "FREE" | "PREMIUM" | "ENTERPRISE";
//   createdAt: Date;
//   updatedAt: Date;
// };

// type Domain = {
//   id: string;
//   domain: string;
//   verificationStatus: DomainVerificationStatus;
//   verificationCode: string;
//   lastVerificationAttempt?: Date;
//   verificationAttempts: number;
//   verifiedAt?: Date;
//   apis: Api[];
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
//   user: User;
// };

// type Api = {
//   id: string;
//   domainId: string;
//   domain: Domain;
//   path: string;
//   name: string;
//   method: methodEnum;
//   headers?: Record<string, unknown>;
//   body?: Record<string, unknown>;
//   pathParams?: Record<string, unknown>;
//   queryParams?: Record<string, unknown>;
//   upTime: number;
//   response: ApiResponse[];
//   dailyStats: DailyStats[];
//   incidents: Incident[];
//   processingStatus: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// };

// type ApiResponse = {
//   id: string;
//   apiId: string;
//   responseTime: number;
//   statusCode: number;
//   status: apiStatusEnum;
//   createdAt: Date;
//   api: Api;
// };

// type DailyStats = {
//   id: string;
//   apiId: string;
//   api: Api;
//   date: Date;
//   upCount: number;
//   totalCount: number;
//   upTime: number;
// };

// type Incident = {
//   id: string;
//   title: string;
//   description?: string;
//   apiId: string;
//   api: Api;
//   startTime: Date;
//   endTime?: Date;
//   status: incidentStatusEnum;
//   createdAt: Date;
//   updatedAt: Date;
// };


