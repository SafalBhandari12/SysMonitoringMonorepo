export const dynamic = "force-dynamic";
import { getUserId } from "@/lib/auth-utils";
import getApi from "@/lib/getApi";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ApisByGroup from "@/components/dashboard/ApisByGroup";
import { prisma } from "@/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Api() {
  try {
    const userId = await getUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationUrl: true },
    });

    const statusPageUrl = `/status/${user?.organizationUrl}`;

    // Build last-N-days range (default 90)
    const days = 90;
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const apisWithUptime = await getApi(userId, 90);

    if (apisWithUptime.length === 0) {
      return (
        <div className="flex flex-col gap-6 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal">APIs</h1>
              <p className="text-sm text-muted-foreground">
                Monitor APIs and group assignments.
              </p>
            </div>
            {user?.organizationUrl && (
              <Button
              asChild
              >
                <Link href={statusPageUrl} target="_blank">
                  <span>View Status Page</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <Card className="border-dashed bg-muted/20">
            <CardHeader>
              <CardTitle>No APIs yet</CardTitle>
              <CardDescription>
                Create your first endpoint after adding an API group.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">APIs</h1>
            <p className="text-sm text-muted-foreground">
              Monitor APIs and group assignments.
            </p>
          </div>
          {user?.organizationUrl && (
            <Button
              asChild
            >
              <Link href={statusPageUrl} target="_blank">
                <span>View Status Page</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <ApisByGroup groupedApis={apisWithUptime} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering APIs server-side:", error);
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Unable to load APIs.</h1>
      </div>
    );
  }
}
