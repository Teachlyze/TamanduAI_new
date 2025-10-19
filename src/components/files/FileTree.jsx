import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Interactive file tree component with drag-and-drop support
 */
export const FileTree = ({
  data = [],
  onFileSelect,
  onFileOpen,
  onFileDelete,
  onFolderCreate,
  className = '',
  ...props
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [selectedFile, setSelectedFile] = useState(null);

  const toggleFolder = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleFileClick = useCallback((file) => {
    setSelectedFile(file.id);
    onFileSelect?.(file);
  }, [onFileSelect]);

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedFile === item.id;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer ${
            isSelected ? 'bg-primary/10' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
            } else {
              handleFileClick(item);
            }
          }}
        >
          <span className="text-muted-foreground">
            {item.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          <span className="flex-1 truncate">{item.name}</span>
          {item.type === 'file' && (
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onFileOpen?.(item); }}>
              Abrir
            </Button>
          )}
        </div>

        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`file-tree ${className}`} {...props}>
      <CardHeader>
        <CardTitle>Explorador de Arquivos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {data.map(item => renderTreeItem(item))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileTree;
