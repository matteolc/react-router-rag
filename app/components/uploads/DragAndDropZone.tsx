import clsx from "clsx";
import { upload } from "@vercel/blob/client";
import { CloudIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Progress } from "~/components/ui/progress";
import { Form } from "react-router";

export const DragAndDropZone = ({
  namespace,
  onUploadComplete,
}: {
  namespace: string;
  onUploadComplete?: () => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<number>(0);

  const createBlob = useCallback(
    async (files: FileList) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setProcessedFiles(0);
        const filesArray = Array.from(files);
        setUploadQueue(filesArray);

        const promises = filesArray.map(async (file) => {
          await upload(file.name, file, {
            access: "public",
            handleUploadUrl: `/api/upload/pdf?namespace=${namespace}`,
            clientPayload: JSON.stringify({ namespace }),
            onUploadProgress: (progress) => {
              setUploadProgress(Math.round(progress.percentage));
            },
          });
          setProcessedFiles((prev) => prev + 1);
        });

        await Promise.all(promises);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
        setUploadQueue([]);
        onUploadComplete?.();
      }
    },
    [namespace, onUploadComplete],
  );

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    await createBlob(files);
  };

  // Calculate both progress values
  const countProgress = (processedFiles / uploadQueue.length) * 100;
  const totalProgress =
    uploadQueue.length > 0 ? (countProgress + uploadProgress) / 2 : 0;

  return (
    <Form>
      <div className="flex w-full items-center justify-center">
        <label
          htmlFor={"file-upload"}
          aria-disabled={isUploading}
          className={clsx(
            isUploading
              ? ""
              : "cursor-pointer hover:bg-accent hover:bg-opacity-10",
            "flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent bg-opacity-60",
          )}
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5 text-accent-foreground">
            {!isUploading ? (
              <>
                <CloudIcon />
                <p className="text-md mb-2">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs">Supports PDF files</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Progress value={totalProgress} className="h-2 w-full" />
                <div className="text-center">
                  <p className="text-md mb-1">
                    Uploading {Math.round(totalProgress)}% ({processedFiles} of{" "}
                    {uploadQueue.length})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {processedFiles === uploadQueue.length
                      ? "Finalizing uploads..."
                      : "Processing files..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </label>
        <input
          id={"file-upload"}
          type="file"
          className="hidden"
          name={"file-upload"}
          multiple={true}
          onChange={handleChange}
          disabled={isUploading}
          accept="application/pdf"
        />
      </div>
    </Form>
  );
};
