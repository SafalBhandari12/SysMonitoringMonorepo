import type { Request, Response } from "express";
import { apiDetailsSchema, domainSchema } from "../schema/schema.js";
import DomainService from "../services/domain.service.js";

class DomainController {
  static async registerDomain(req: Request, res: Response) {
    const data = await domainSchema.parseAsync(req.body);
    const userId = req.session.sessionId!;

    await DomainService.registerDomain(data.domain, userId);
    return res.redirect(`${process.env.FRONTEND_URL}/domainVerification`);
  }
  static async verifyDomain(req: Request, res: Response) {
    const data = await domainSchema.parseAsync(req.query);
    const userId = req.session.sessionId!;
    console.log("Verifying domain:", data.domain);
    const result = await DomainService.verifyDomain(data.domain, userId);
    if (result.verificationStatus === "VERIFIED") {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
    return res.json(result);
  }
  static async GetVerificationStatus(req: Request, res: Response) {
    const data = await domainSchema.parseAsync(req.query);
    const userId = req.session.sessionId!;
    const isVerified = await DomainService.getVerificationStatus(
      data.domain,
      userId,
    );
    if (isVerified) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
    return res.json({ verified: false });
  }
  static async apiStatusDetails(req: Request, res: Response) {
    const data = await domainSchema.parseAsync(req.query);
    const userId = req.session.sessionId!;
    const response = await DomainService.apiStatusDetails(data.domain, userId);
    return res.json(response);
  }
  static async verificationInstructions(req: Request, res: Response) {
    const data = await domainSchema.parseAsync(req.query);
    const userId = req.session.sessionId!;
    const response = await DomainService.getVerificationInstructions(
      data.domain,
      userId,
    );
    return res.json(response);
  }
}
export default DomainController;
