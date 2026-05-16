import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import getApi from "@/lib/getApi";
import ApisByGroup from "@/components/dashboard/ApisByGroup";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 7200; // Cache for 2 hours

interface PageProps {
  params: Promise<{ orgName: string }>;
}

export default async function PublicStatusPage(props: PageProps) {
  const params = await props.params;
  const decodedOrgName = decodeURIComponent(params.orgName).trim();

  const user = await prisma.user.findUnique({
    where: { organizationUrl: decodedOrgName },
    select: { id: true, organizationName: true, organizationUrl: true },
  });


  if (!user) {
    notFound();
  }

  try {
    const apisWithUptime = await getApi(user.id, 90);

    if (apisWithUptime.length === 0) {
      return (
        <div className="light bg-background text-foreground min-h-screen">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 px-6 py-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-normal">
                  {user.organizationName} Status
                </h1>
                <p className="text-sm text-muted-foreground">
                  Current status and uptime history.
                </p>
              </div>
            </div>
            <Card className="border-dashed bg-muted/20">
              <CardHeader>
                <CardTitle>No APIs yet</CardTitle>
                <CardDescription>
                  This organization hasn't added any public endpoints yet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="light bg-background text-foreground min-h-screen">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 px-6 py-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal">
                {user.organizationName} Status
              </h1>
              <p className="text-sm text-muted-foreground">
                Current status and uptime history.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ApisByGroup groupedApis={apisWithUptime} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering public status page:", error);
    return (
      <div className="light bg-background text-foreground flex h-screen items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Unable to load status page.</h1>
      </div>
    );
  }
}
