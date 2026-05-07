import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CardSmall({ title, value }: { title: string; value: string }) {
  return (
    <Card size="default" className="items-start gap-2 px-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-1">
        <CardTitle className="text-2xl font-semibold tracking-normal">
          {value}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
