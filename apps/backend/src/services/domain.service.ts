import { DomainVerificationStatus } from "../generated/prisma/enums.js";
import {
  BadRequestError,
  CONFLICT_ERROR,
  NotFoundError,
} from "../lib/AppError.js";
import prisma from "../utils/prisma.js";
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
    return response;
  }
  static async verifyDomain(domain: string, userId?: string) {
    const domainDetails = await prisma.domain.findFirst({
      where: { domain: domain },
    });
    console.log(domainDetails);
    if (!domainDetails) {
      throw new NotFoundError("Domain not found");
    }
    if (userId && domainDetails.userId !== userId) {
      throw new NotFoundError("Domain not found");
    }
    if (
      domainDetails.verificationStatus === DomainVerificationStatus.VERIFIED
    ) {
      throw new CONFLICT_ERROR("Domain already verified");
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
      console.error(`DNS lookup failed for ${domain}:`, error);
    }

    const ATTEMPT_MULTIPLIER = 5; // 5 minutes base
    const nextAttempt = isVerified
      ? new Date()
      : new Date(
          Date.now() +
            (domainDetails.verificationAttempts + 1) *
              ATTEMPT_MULTIPLIER *
              60 *
              1000,
        );

    const updateData = {
      lastVerificationAttempt: new Date(),
      verificationAttempts: domainDetails.verificationAttempts + 1,
      verificationStatus: isVerified
        ? DomainVerificationStatus.VERIFIED
        : DomainVerificationStatus.FAILED,
      verifiedAt: isVerified ? new Date() : null,
      nextVerificationAt: nextAttempt,
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
    if (api.verificationStatus === "VERIFIED") {
      return true;
    } else {
      return false;
    }
  }
  static async cronJobDomainVerification() {
    const MAX_ATTEMPTS = 20;

    const domainsToVerify = await prisma.domain.findMany({
      where: {
        verificationStatus: DomainVerificationStatus.PENDING,
        verificationAttempts: {
          lt: MAX_ATTEMPTS,
        },
        nextVerificationAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        nextVerificationAt: "asc",
      },
      take: 1000,
      select: {
        domain: true,
      },
    });

    if (domainsToVerify.length === 0) {
      console.log("No domains to verify at this time");
      return;
    }
    console.log(`Verifying ${domainsToVerify.length} domains`);

    // Process domains in batches of 10 in parallel
    const BATCH_SIZE = 100;
    for (let i = 0; i < domainsToVerify.length; i += BATCH_SIZE) {
      const batch = domainsToVerify.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (domain) => {
          try {
            await this.verifyDomain(domain.domain);
          } catch (error) {
            console.error(`Error verifying domain ${domain.domain}:`, error);
          }
        }),
      );
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
      instructions: `To verify your domain, please add the following TXT record to your DNS settings:`,
      txtRecord: `monitoring-verify=${domainData.verificationCode}`,
      steps: [
        "Log in to your domain registrar or DNS provider",
        "Navigate to DNS settings or DNS records management",
        "Create a new TXT record with the following details:",
      ],
      recordDetails: {
        type: "TXT",
        name: domain,
        value: `monitoring-verify=${domainData.verificationCode}`,
        ttl: "3600 (or your provider's default)",
      },
      notes:
        "DNS propagation may take up to 24 hours. We'll automatically verify your domain once the record is detected.",
    };
  }
}
export default DomainService;
