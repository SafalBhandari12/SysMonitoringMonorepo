import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CardSmall({ title, value }: { title: string; value: string }) {
  return (
    <Card size="default" className="mx-auto px-9 items-start">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardTitle>{value}</CardTitle>
      </CardContent>
    </Card>
  );
}
