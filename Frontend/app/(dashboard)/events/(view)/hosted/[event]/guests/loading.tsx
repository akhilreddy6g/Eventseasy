import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Card className="flex-1 animate-pulse">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allguests">
          <TabsList className="flex gap-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </TabsList>

          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
