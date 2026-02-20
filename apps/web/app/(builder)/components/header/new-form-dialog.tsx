"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBuilderStore } from "../../lib/store";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  File02Icon,
  Upload04Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import {
  fromBuilderDocument,
  parseBuilderDocumentJson,
  type BuilderDocumentState,
} from "../../lib/persistence";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const MIN_IMPORT_FEEDBACK_MS = 500;

type PendingImport = {
  fileName: string;
  formName: string;
  nodeCount: number;
  state: BuilderDocumentState;
};

export function NewFormDialog() {
  const [open, setOpen] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [pendingImport, setPendingImport] =
    React.useState<PendingImport | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const clearState = useBuilderStore((state) => state.clearState);
  const loadDocumentState = useBuilderStore((state) => state.loadDocumentState);
  const hasContent = useBuilderStore((state) => state.rootIds.length > 0);

  const resetImportState = React.useCallback(() => {
    setIsImporting(false);
    setPendingImport(null);
    setImportError(null);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetImportState();
    }
  };

  const handleNewForm = () => {
    clearState();
    handleOpenChange(false);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    loadDocumentState(pendingImport.state);
    toast.success(`Imported "${pendingImport.formName}"`);
    handleOpenChange(false);
  };

  const handleImportClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const startedAt = Date.now();
    setImportError(null);
    setPendingImport(null);
    setIsImporting(true);

    try {
      const contents = await file.text();
      const document = parseBuilderDocumentJson(contents);
      const importedState = fromBuilderDocument(document);
      setPendingImport({
        fileName: file.name,
        formName: importedState.formName,
        nodeCount: Object.keys(importedState.nodes).length,
        state: importedState,
      });
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Failed to import file.";
      const message = `Invalid BuzzForm file: ${rawMessage}`;
      setImportError(message);
      toast.error(message);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_IMPORT_FEEDBACK_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_IMPORT_FEEDBACK_MS - elapsed),
        );
      }
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="group gap-2">
            <HugeiconsIcon
              icon={Add01Icon}
              size={16}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            New
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            {hasContent
              ? "Starting fresh will replace your current workspace. Choose how you want to begin."
              : "Start from scratch or restore a previously saved project file."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 py-2">
          <Card
            size="sm"
            className="group cursor-pointer transition-all duration-200 hover:ring-primary/40"
            onClick={handleNewForm}
          >
            <CardContent className="flex justify-center">
              <HugeiconsIcon
                icon={Add01Icon}
                size={24}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </CardContent>
            <CardHeader className="justify-center text-center">
              <CardTitle>Start Blank</CardTitle>
              <CardDescription>Create a fresh empty form</CardDescription>
            </CardHeader>
          </Card>

          <Card
            size="sm"
            className="group cursor-pointer transition-all duration-200 hover:ring-primary/40"
            onClick={handleImportClick}
          >
            <CardContent className="flex justify-center">
              {isImporting ? (
                <Spinner className="size-6" />
              ) : (
                <HugeiconsIcon
                  icon={Upload04Icon}
                  size={24}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5"
                />
              )}
            </CardContent>
            <CardHeader className="justify-center text-center">
              <CardTitle>
                {pendingImport ? "Choose Another" : "Import File"}
              </CardTitle>
              <CardDescription>Restore from .buzzform.json</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {pendingImport && !isImporting && !importError && (
          <Card
            size="sm"
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={File02Icon} size={16} />
                {pendingImport.formName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {pendingImport.fileName}
                <Separator orientation="vertical" className="h-3" />
                <Badge variant="secondary">
                  {pendingImport.nodeCount} nodes
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {isImporting && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span className="animate-pulse">Validating file...</span>
          </div>
        )}

        {importError && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert01Icon} size={16} />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <input
            ref={fileInputRef}
            type="file"
            accept=".buzzform.json,.json,application/json"
            className="hidden"
            onChange={handleFileImport}
          />
          <DialogClose
            render={
              <Button variant="outline" disabled={isImporting}>
                Cancel
              </Button>
            }
          />
          {pendingImport && (
            <Button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="transition-transform active:scale-95"
            >
              Import & Replace
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
