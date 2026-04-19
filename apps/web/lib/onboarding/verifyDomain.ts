import axios from "axios";
import * as cheerio from "cheerio";
import dns from "dns/promises";
dns.setServers(["8.8.8.8"]);

type VerifyMetaOptions = {
  domain: string;
  verificationCode: string;
  timeoutMs?: number;
};

export async function verifyDomainWithMETA({
  domain,
  verificationCode,
  timeoutMs = 60000, // 1 minute default timeout
}: VerifyMetaOptions): Promise<boolean> {
  try {
    console.log(`[META] Starting verification for ${domain}`);
    const url = `https://${domain}`;
    const res = await axios.get(url, {
      timeout: timeoutMs,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.google.com/",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      validateStatus: () => true,
    });
    console.log(`[META] Response status for ${domain}:`, res.status);
    if (!res.data || typeof res.data !== "string") {
      console.log(`[META] Invalid response data for ${domain}`);
      return false;
    }
    const $ = cheerio.load(res.data);
    const content = $(`meta[name="sysMonitoring-Verification"]`).attr(
      "content",
    );
    return content === verificationCode;
  } catch (error) {
    console.error(`[META] Error verifying ${domain}:`, error);
    return false;
  }
}

const verifyDomain = async (
  domain: string,
  verificationCode: string,
  method: "DNS" | "META" | "BOTH",
): Promise<boolean> => {
  switch (method) {
    case "DNS":
      return await verifyDomainWithDNS(domain, verificationCode);
    case "META":
      return await verifyDomainWithMETA({ domain, verificationCode });
    case "BOTH":
      return Promise.all([
        verifyDomainWithDNS(domain, verificationCode),
        verifyDomainWithMETA({ domain, verificationCode }),
      ]).then(([dnsResult, metaResult]) => dnsResult || metaResult);
  }
};
const verifyDomainWithDNS = async (
  domain: string,
  verificationCode: string,
): Promise<boolean> => {
  try {
    const ns = await dns.resolveNs(domain);

    if (!ns[0]) {
      return false;
    }
    const nsIpRecords = await dns.resolve4(ns[0]);
    const nsIp = nsIpRecords[0];

    if (!nsIp) {
      return false;
    }

    const resolver = new dns.Resolver();
    resolver.setServers([nsIp]);

    const txtRecords = await resolver.resolveTxt(domain);
    console.log(`TXT records for ${domain}:`, txtRecords);
    const expectedToken = `sysMonitoring-Verification=${verificationCode}`;
    for (const record of txtRecords) {
      if (record.join("") === expectedToken) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default verifyDomain;
