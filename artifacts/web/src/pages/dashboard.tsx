import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetWorkEntries, useDeleteWorkEntry, getGetDashboardStatsQueryKey, getGetWorkEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Trash2, Users, Square, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/entry");
    }
  }, [user, setLocation]);

  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats({
    query: { enabled: !!user && user.role === "admin", queryKey: getGetDashboardStatsQueryKey() }
  });

  const { data: entries, isLoading: isEntriesLoading } = useGetWorkEntries(undefined, {
    query: { enabled: !!user && user.role === "admin", queryKey: getGetWorkEntriesQueryKey() }
  });

  const deleteEntry = useDeleteWorkEntry();

  const handleDelete = (id: number) => {
    deleteEntry.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Entry deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWorkEntriesQueryKey() });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to delete entry" });
        }
      }
    );
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/reports/export-excel", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } catch (err) {
      toast({ variant: "destructive", title: "Export failed" });
    }
  };

  const handleExportPdf = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/reports/export-pdf", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      a.click();
    } catch (err) {
      toast({ variant: "destructive", title: "Export failed" });
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Overview of all field operations and metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="bg-white">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf} className="bg-white">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Labour</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{stats?.todayLabour || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
            <Square className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{stats?.todaySquareMeter || 0} <span className="text-lg text-muted-foreground">sqm</span></div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Month Labour</CardTitle>
            <CalendarDays className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{stats?.monthLabour || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{stats?.totalEntries || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Field Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isEntriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Labour</TableHead>
                    <TableHead className="text-right">Progress (sqm)</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No entries recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {entries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{entry.workingChannel}</TableCell>
                      <TableCell className="text-right font-semibold">{entry.labourCount}</TableCell>
                      <TableCell className="text-right font-semibold">{entry.squareMeter}</TableCell>
                      <TableCell>{entry.createdByName}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the entry for {entry.workingChannel} on {format(new Date(entry.date), 'MMM dd, yyyy')}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
