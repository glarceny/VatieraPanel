import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ServerList } from "@/components/dashboard/server-list";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ServersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: servers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/servers"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isMobile={true} 
      />
      <div className="md:ml-64">
        <Header 
          title="Servers" 
          subtitle="Manage all your servers"
          onMenuClick={() => setSidebarOpen(true)}
          action={
            <Button data-testid="button-create-server" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Create Server
            </Button>
          }
        />
        
        <main className="p-4 md:p-6">
          <div className="sm:hidden mb-4">
            <Button data-testid="button-create-server-mobile" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Server
            </Button>
          </div>
          <ServerList servers={servers || []} fullWidth />
        </main>
      </div>
    </div>
  );
}
