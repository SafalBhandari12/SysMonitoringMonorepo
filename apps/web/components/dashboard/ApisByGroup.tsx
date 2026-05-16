"use client";

import { useState } from "react";
import { ChevronDown, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import UptimeBars from "@/components/dashboard/UptimeBars";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UptimeEntry = {
  date: string;
  up: boolean;
  upCount: number;
  totalCount: number;
  hasData?: boolean;
};

type Api = {
  id: string;
  name: string;
  uptime: UptimeEntry[];
  currentUptime: number | null;
  apiGroup: {
    name: string;
  };
};

type GroupedApiData = {
  groupName: string;
  apis: Api[];
  aggregateUptime: number | null;
  aggregateUptimeBars: UptimeEntry[];
};

interface ApisByGroupProps {
  groupedApis: GroupedApiData[];
}

export default function ApisByGroup({ groupedApis }: ApisByGroupProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (groupedApis.length > 0) {
      return new Set([groupedApis[0].groupName]);
    }
    return new Set();
  });

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <Card className="shadow-sm overflow-hidden bg-card border">
      <div className="flex flex-col">
        {groupedApis.map(
          ({
            groupName,
            apis: groupApis,
            aggregateUptime,
            aggregateUptimeBars,
          }) => {
            const isExpanded = expandedGroups.has(groupName);
            // Consider "up" if uptime is 99% or greater. Otherwise alert.
            const isAllUp = (aggregateUptime ?? 100) >= 99;
            const StatusIcon = isAllUp ? CheckCircle2 : AlertCircle;
            const statusColor = isAllUp ? "text-emerald-500" : "text-amber-500";

            const uptimeText = `${(aggregateUptime ?? 0).toFixed(2)}% uptime`;

            return (
              <div key={groupName} className="flex flex-col">
                <div
                  className="cursor-pointer transition-colors px-4 py-2 flex flex-col gap-1.5"
                  onClick={() => toggleGroup(groupName)}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${statusColor} shrink-0`} />
                      <span className="font-semibold text-base">{groupName}</span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground shrink-0 cursor-help ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Uptime data for {groupName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <span className="text-sm text-muted-foreground ml-3 flex items-center gap-1 font-medium">
                        {groupApis.length} component{groupApis.length !== 1 ? "s" : ""}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ml-1 ${isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                        />
                      </span>
                    </div>
                    <div className={`text-sm text-muted-foreground font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
                      {uptimeText}
                    </div>
                  </div>

                  {/* Uptime Bar for Group */}
                  <div
                    className="hidden sm:grid transition-all duration-300 ease-in-out w-full"
                    style={{
                      gridTemplateRows: (!isExpanded && aggregateUptimeBars.length > 0) ? "1fr" : "0fr",
                      opacity: (!isExpanded && aggregateUptimeBars.length > 0) ? 1 : 0,
                    }}
                  >
                    <div 
                      className={`overflow-hidden transition-transform duration-300 ease-in-out ${
                        (!isExpanded && aggregateUptimeBars.length > 0) ? "translate-y-0" : "translate-y-4"
                      }`}
                    >
                      {aggregateUptimeBars.length > 0 && (
                        <UptimeBars
                          days={90}
                          initialData={aggregateUptimeBars}
                          currentUptime={aggregateUptime}
                          cellHeight={18}
                          cellWidth={6}
                          maxRows={1}
                          showLabel={false}
                          showHeader={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Components List */}
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr", opacity: isExpanded ? 1 : 0 }}
                >
                  <div 
                    className={`overflow-hidden transition-transform duration-300 ease-in-out ${
                      isExpanded ? "translate-y-0" : "translate-y-4"
                    }`}
                  >
                    <div className="bg-muted/10 flex flex-col">
                    {groupApis.length > 0 && groupApis.map((api, index) => {
                      const apiIsAllUp = (api.currentUptime ?? 100) >= 99;
                      const ApiStatusIcon = apiIsAllUp ? CheckCircle2 : AlertCircle;
                      const apiStatusColor = apiIsAllUp ? "text-emerald-500" : "text-amber-500";
                      const apiUptimeText = `${(api.currentUptime ?? 0).toFixed(2)}% uptime`;

                      return (
                        <div
                          key={api.id}
                          className="px-4 py-2 pl-8 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ApiStatusIcon className={`h-4 w-4 ${apiStatusColor} shrink-0`} />
                              <span className="text-sm font-medium">
                                {api.name}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              {apiUptimeText}
                            </div>
                          </div>

                          {api.uptime.length > 0 && (
                            <div className="w-full mt-1 hidden sm:block">
                              <UptimeBars
                                days={90}
                                initialData={api.uptime}
                                currentUptime={api.currentUptime}
                                cellHeight={16}
                                cellWidth={6}
                                maxRows={1}
                                showLabel={false}
                                showHeader={false}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </Card>
  );
}
