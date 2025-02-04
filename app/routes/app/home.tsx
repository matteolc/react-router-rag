import { Heading, HeadingWrapper } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";
import { MessageSquareText, Sparkles, FileText } from 'lucide-react';
import { getWorkspace } from "~/hooks/use-workspace";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/home";
import { data, Link, useLoaderData } from "react-router";
import { formatTokens } from "~/lib/string";
import { Badge } from "~/components/ui/badge";
import { humanReadableMIMEType } from "~/lib/file";
import { Timestamp } from "~/components/timestamp";

export async function loader({ request }: Route.LoaderArgs) {
  const { auth, supabase } = supabaseAuth({ request });
  const { profile } = await auth.getProfile();
  const workspace = getWorkspace(request);

  const { data: tokenUsage } = await supabase
    .from("token_aggregation")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("namespace", workspace)
    .order("time_bucket", { ascending: false })
    .limit(30);

  const { data: recentFiles } = await supabase
    .from("uploads")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("namespace", workspace)
    .order("created_at", { ascending: false })
    .limit(3);

  return data({ profile, tokenUsage: tokenUsage || [], recentFiles: recentFiles || [] });
}

export default function Screen() {
  const { profile, tokenUsage, recentFiles } = useLoaderData<typeof loader>();
  
  // Helper to calculate service usage
  const getServiceUsage = (service: 'chat' | 'summarization' | 'extraction') => {
    const daily = tokenUsage?.filter(entry => 
      entry.service === service &&
      new Date(entry.time_bucket).toDateString() === new Date().toDateString()
    ).reduce((sum, entry) => sum + (entry.total_tokens || 0), 0) || 0;

    const total = tokenUsage?.filter(entry => 
      entry.service === service
    ).reduce((sum, entry) => sum + (entry.total_tokens || 0), 0) || 0;

    return { daily, total };
  };

  return (
    <div className="space-y-8">
      <HeadingWrapper className="flex items-center justify-between">
        <div>
          <Heading>Welcome back, {profile.first_name}</Heading>
          <p className="text-muted-foreground mt-1">Here's your daily overview</p>
        </div>
      </HeadingWrapper>

      {/* Updated Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Chat Usage */}
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent p-3">
              <MessageSquareText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chat Usage</p>
              <p className="text-2xl font-semibold">
                {formatTokens(getServiceUsage('chat').daily)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTokens(getServiceUsage('chat').total)} total
              </p>
            </div>
          </div>
        </div>

        {/* Summarization Usage */}
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent p-3">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Summarization</p>
              <p className="text-2xl font-semibold">
                {formatTokens(getServiceUsage('summarization').daily)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTokens(getServiceUsage('summarization').total)} total
              </p>
            </div>
          </div>
        </div>

        {/* Extraction Usage */}
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent p-3">
              <FileText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Extraction</p>
              <p className="text-2xl font-semibold">
                {formatTokens(getServiceUsage('extraction').daily)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTokens(getServiceUsage('extraction').total)} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Files</h3>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <Link to="/uploads" prefetch="intent">
              View all
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {recentFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Link to={`/uploads/${file.id}`} className="font-medium" prefetch="intent">{file.name}</Link>
                <Badge variant="outline" className="text-sm text-muted-foreground">{humanReadableMIMEType(file.type)}</Badge>
              </div>
              <span className="text-sm text-muted-foreground"><Timestamp timestamp={file.created_at} /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
