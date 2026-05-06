import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { incidentStatusEnum, regions } from "@/prisma/generated/prisma/enums";
import {
  CircleAlert,
  GitCompareArrowsIcon,
  GitForkIcon,
  GitMergeIcon,
  GitPullRequestArrowIcon,
  HistoryIcon,
} from "lucide-react";

type incidentsType = {
  title: string;
  regions: regions[];
  startTime: Date;
  endTime: Date | null;
  status: incidentStatusEnum;
};

function formatDuration(start: Date, end: Date) {
  const diffMs = end.getTime() - start.getTime();

  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

export function TimeLine({ incidents }: { incidents: incidentsType[] }) {
  return (
    <Timeline defaultValue={3}>
      {incidents.map((incident) => (
        <TimelineItem
          key={incident.title}
          step={incident.startTime.getTime()}
          className="group-data-[orientation=vertical]/timeline:ms-10"
        >
          <TimelineHeader>
            <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
            <TimelineTitle className="mt-0.5">{incident.title}</TimelineTitle>
            <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
              {incident.status === incidentStatusEnum.RESOLVED ? (
                <HistoryIcon size={12} />
              ) : (
                <CircleAlert size={12} />
              )}
            </TimelineIndicator>
          </TimelineHeader>
          <TimelineContent>
            {incident.startTime.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            -{" "}
            {incident.endTime
              ? `${incident.endTime.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })} - Duration: ${formatDuration(incident.startTime, incident.endTime)}`
              : "Ongoing"}
            <br />
            Regions: {incident.regions.join(", ")}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
