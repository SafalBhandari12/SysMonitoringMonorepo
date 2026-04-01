
import { DomainVerificationStatus } from "@repo/db";
import {
  BadRequestError,
  CONFLICT_ERROR,
  NotFoundError,
} from "../lib/AppError.js";
import domainVerificationQueue from "../queue/domainVerificationQueue.js";
import prisma from "@repo/db/client";
import dns from "dns/promises";
dns.setServers(["8.8.8.8"]);

class DomainService {
  static async registerDomain(domain: string, userId: string) {
    const existingDomain = await prisma.domain.findFirst({
      where: {
        domain,
      },
    });
    if (existingDomain) {
      throw new CONFLICT_ERROR("A domain with this name already exists");
    }
    const response = await prisma.domain.create({
      data: {
        domain,
        userId,
      },
      select: {
        id: true,
        domain: true,
        verificationCode: true,
        verificationStatus: true,
      },
    });
    console.log("Domain registered:", response);
    await domainVerificationQueue.add(
      "verify-domain",
      {
        domain: response.domain,
      },
      {
        jobId: `verify-domain-${response.domain}`,
        attempts: 20,
        backoff: {
          type: "exponential",
          delay: 60 * 1000, //1 minute
        },
        removeOnComplete: 200,
        removeOnFail: 200,
      },
    );
    return response;
  }
  static async verifyDomain(domain: string, userId?: string) {
    const domainDetails = await prisma.domain.update({
      where: { domain: domain },
      data: {
        lastVerificationAttempt: new Date(),
        verificationAttempts: {
          increment: 1,
        },
      },
    });

    if (!domainDetails) {
      throw new NotFoundError("Domain not found");
    }
    if (userId && domainDetails.userId !== userId) {
      throw new NotFoundError("Domain not found");
    }
    if (
      domainDetails.verificationStatus === DomainVerificationStatus.VERIFIED
    ) {
      return { verificationStatus: DomainVerificationStatus.VERIFIED };
    }
    let isVerified = false;
    try {
      // Use the input as the hostname for DNS lookup
      const ns = await dns.resolveNs(domain);

      // Resolve first NS hostname to IP
      if (!ns[0]) {
        throw new BadRequestError("No NS records found for domain");
      }
      const nsIpRecords = await dns.resolve4(ns[0]);
      const nsIp = nsIpRecords[0];

      if (!nsIp) {
        throw new BadRequestError("No A records found for NS hostname");
      }

      const resolver = new dns.Resolver();
      resolver.setServers([nsIp]);

      const txtRecords = await resolver.resolveTxt(domain);
      console.log(`TXT records for ${domain}:`, txtRecords);
      const expectedToken = `monitoring-verify=${domainDetails.verificationCode}`;
      for (const record of txtRecords) {
        if (record.join("") === expectedToken) {
          isVerified = true;
        }
      }
    } catch (error) {
      throw new BadRequestError(
        `DNS lookup failed: ${(error as Error).message}`,
      );
    }

    const updateData = {
      lastVerificationAttempt: new Date(),
      verificationAttempts: domainDetails.verificationAttempts + 1,
      verificationStatus: isVerified
        ? DomainVerificationStatus.VERIFIED
        : DomainVerificationStatus.FAILED,
      verifiedAt: isVerified ? new Date() : null,
    };
    const updated = await prisma.domain.update({
      where: { domain },
      data: {
        ...updateData,
      },
      select: {
        verificationStatus: true,
      },
    });
    return updated;
  }
  static async getVerificationStatus(domain: string, userId: string) {
    const api = await prisma.domain.findUnique({
      where: { domain: domain, userId },
      select: { verificationStatus: true, verificationCode: true },
    });
    if (!api) {
      throw new NotFoundError("Domain not found");
    }
    if (api.verificationStatus === DomainVerificationStatus.VERIFIED) {
      return true;
    } else {
      return false;
    }
  }
  static async apiStatusDetails(domain: string, userId: string) {
    const domainData = await prisma.domain.findUnique({
      where: { domain, userId },
      select: {
        id: true,
      },
    });
    if (!domainData) {
      throw new NotFoundError("Domain not found");
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const apis = await prisma.api.findMany({
      where: {
        domainId: domainData.id,
      },
      select: {
        id: true,
        name: true,
        path: true,
        method: true,
        upTime: true,
        dailyStats: {
          where: {
            date: {
              gte: ninetyDaysAgo,
            },
          },
          select: {
            date: true,
            upCount: true,
            totalCount: true,
            upTime: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });
    const groupedApis = apis.reduce(
      (groups: { [key: string]: typeof apis }, api) => {
        const groupId = api.path.split("/")[1] || "root";
        if (!groups[groupId]) {
          groups[groupId] = [];
        }
        groups[groupId].push(api);
        return groups;
      },
      {},
    );
    return groupedApis;
  }
  static async getVerificationInstructions(domain: string, userId: string) {
    const domainData = await prisma.domain.findUnique({
      where: { domain, userId },
      select: {
        verificationCode: true,
      },
    });
    if (!domainData) {
      throw new NotFoundError("Domain not found");
    }
    return {
      verificationCode: domainData.verificationCode,
    };
  }
}
export default DomainService;
