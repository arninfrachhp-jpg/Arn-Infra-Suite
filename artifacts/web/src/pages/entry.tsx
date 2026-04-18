import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkEntry } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Users, Square, MapPin } from "lucide-react";

const entrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  workingChannel: z.string().min(1, "Working channel is required"),
  labourCount: z.coerce.number().min(1, "Labour count must be at least 1"),
  squareMeter: z.coerce.number().min(0, "Square meter cannot be negative"),
});

type EntryFormValues = z.infer<typeof entrySchema>;

export default function Entry() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createEntry = useCreateWorkEntry();

  useEffect(() => {
    if (user && user.role !== "operator") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      workingChannel: "",
      labourCount: 0,
      squareMeter: 0,
    },
  });

  const onSubmit = (data: EntryFormValues) => {
    createEntry.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Entry Recorded", description: "Your daily progress has been logged." });
          form.reset({
            date: format(new Date(), "yyyy-MM-dd"),
            workingChannel: "",
            labourCount: 0,
            squareMeter: 0,
          });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to record entry", description: (err as any)?.data?.error || err.message || "An error occurred." });
        }
      }
    );
  };

  if (!user || user.role !== "operator") return null;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Field Data Entry</h1>
        <p className="text-muted-foreground mt-1">Log today's operations and progress metrics.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle>Daily Progress Report</CardTitle>
            <CardDescription>Fill out accurate metrics for your assigned channel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reporting Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-muted/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workingChannel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Channel</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. Channel A-North" className="pl-9 bg-muted/50" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="labourCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labour Count</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="number" min="0" className="pl-9 bg-muted/50 font-semibold text-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="squareMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress (Square Meters)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Square className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="number" min="0" step="0.1" className="pl-9 bg-muted/50 font-semibold text-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full font-bold text-lg h-14 mt-4" 
                  disabled={createEntry.isPending}
                >
                  {createEntry.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
