import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface FileManagerProps {
  serverId?: string;
}

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  icon: string;
}

export function FileManager({ serverId }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/home/container");
  
  // Mock file data - in real implementation, this would come from API
  const files: FileItem[] = [
    { name: "EssentialsX", type: "folder", modified: "2 days ago", icon: "fas fa-folder" },
    { name: "server.properties", type: "file", size: "2.1KB", modified: "1 hour ago", icon: "fas fa-file-alt" },
    { name: "world_backup.zip", type: "file", size: "256MB", modified: "Yesterday", icon: "fas fa-file-archive" },
    { name: "plugins", type: "folder", modified: "3 days ago", icon: "fas fa-folder" },
    { name: "logs", type: "folder", modified: "Today", icon: "fas fa-folder" },
    { name: "whitelist.json", type: "file", size: "453B", modified: "1 week ago", icon: "fas fa-file-code" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>File Manager</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" data-testid="button-upload-file">
              <Upload className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <Button size="sm" variant="outline" data-testid="button-new-folder">
              <FolderPlus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">New Folder</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!serverId ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-folder text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No server selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a server to browse and manage files
            </p>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 mb-4 text-sm">
              <span className="text-muted-foreground">Path:</span>
              <span className="text-primary cursor-pointer hover:text-primary/80" data-testid="breadcrumb-path">
                {currentPath}
              </span>
            </div>

            {/* File List */}
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-accent rounded-lg transition-smooth cursor-pointer space-y-2 sm:space-y-0"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${file.icon} ${file.type === 'folder' ? 'text-primary' : 'text-muted-foreground'}`}></i>
                    <span className="text-sm text-foreground" data-testid={`file-name-${index}`}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span data-testid={`file-size-${index}`}>
                        {file.size || "--"}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span data-testid={`file-modified-${index}`}>
                        {file.modified}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-file-actions-${index}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
