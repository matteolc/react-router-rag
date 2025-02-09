import { Link, useLoaderData } from "react-router";
import { data } from "react-router";
import type { Route } from "./+types/uploads.$id";
import { VectorStore } from "~/services/vector-store";
import { Heading, HeadingWrapper } from "~/components/ui/heading";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { humanReadableFileSize, humanReadableMIMEType } from "~/lib/file";
import { supabaseAuth } from "~/lib/supabase-auth";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Timestamp } from "~/components/timestamp";
import { useState } from "react";
import { FileNotFoundDialog } from "~/components/uploads/file-not-found-dialog";
import { handleDownload } from "~/lib/handle-download";

type PdfMetadata = {
  info?: {
    Creator?: string;
    ModDate?: string;
    Trapped?: { name: string };
    Producer?: string;
    CreationDate?: string;
    IsXFAPresent?: boolean;
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
  };
  metadata?: {
    _metadata?: {
      "xmp:createdate"?: string;
      "xmp:modifydate"?: string;
      "xmp:creatortool"?: string;
      // Add other needed xmp fields
    } & Record<string, unknown>;
  };
  version?: string;
  totalPages?: number;
};

type DocumentMetadata = {
  pdf?: PdfMetadata;
  domain?: string;
  topics?: string[];
  key_entities?: string[];
  document_type?: string;
  technical_level?: string;
  content?: string;
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params;
  const { supabase } = supabaseAuth({ request });

  const { data: upload, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Upload not found");
  if (!upload) throw new Error("Upload not found");

  const vectorStore = new VectorStore({ request });
  const documents = await vectorStore.queryVectorStore({
    query: "",
    filter: { upload_id: id },
    k: 1,
  });

  return data({
    upload,
    documentMeta: documents[0]?.metadata as DocumentMetadata,
    pdfInfo: documents[0]?.metadata.pdf as PdfMetadata,
    content: documents[0]?.pageContent,
  });
}

export default function Screen() {
  const { upload, documentMeta, pdfInfo, content } =
    useLoaderData<typeof loader>();
  const [errorOpen, setErrorOpen] = useState(false);
  return (
    <div className="space-y-6">
      <HeadingWrapper>
        <Heading>Upload Details</Heading>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/uploads">Back</Link>
          </Button>
          <Button
            onClick={() =>
              handleDownload({
                url: (upload.metadata as { url: string }).url,
                name: upload.name,
                onError: (error) => setErrorOpen(true),
              })
            }
          >
            Download
          </Button>
        </div>
      </HeadingWrapper>

      {/* Basic File Info */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold">{upload.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {humanReadableMIMEType(upload.type)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {humanReadableFileSize(upload.size)}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>
              Uploaded <Timestamp timestamp={upload.created_at} />
            </p>
            {pdfInfo?.totalPages && <p>{pdfInfo.totalPages} pages</p>}
          </div>
        </div>
      </Card>

      {/* Document Metadata */}
      {documentMeta && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Document Type</span>
                <Badge variant="outline">{documentMeta.document_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Domain</span>
                <Badge variant="outline">{documentMeta.domain}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Technical Level</span>
                <Badge variant="outline">{documentMeta.technical_level}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Topics</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {documentMeta.topics?.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Key Entities
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {documentMeta.key_entities?.map((entity) => (
                    <Badge
                      key={entity}
                      variant="secondary"
                      className="text-xs font-medium hover:shadow-sm transition-shadow"
                    >
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Technical PDF Metadata */}
          {pdfInfo && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                PDF Technical Details
              </h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Creator</TableCell>
                    <TableCell>
                      {pdfInfo.metadata?._metadata?.["xmp:creatortool"]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created</TableCell>
                    <TableCell>
                      <Timestamp
                        timestamp={
                          pdfInfo.metadata?._metadata?.["xmp:createdate"] ??
                          null
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Modified</TableCell>
                    <TableCell>
                      <Timestamp
                        timestamp={
                          pdfInfo.metadata?._metadata?.["xmp:modifydate"] ??
                          null
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PDF Version</TableCell>
                    <TableCell>{pdfInfo.version}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {!documentMeta && (
        <Card className="p-6 text-center text-muted-foreground">
          No additional document metadata found
        </Card>
      )}

      {/* Document Summary */}
      {content && (
        <div className="space-y-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="summary">
              <AccordionTrigger>Document Summary</AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose text-xs font-sans"
                  style={
                    {
                      "--tw-prose-body": "--primary-foreground",
                    } as React.CSSProperties
                  }
                >
                  {content}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      <FileNotFoundDialog open={errorOpen} onOpenChange={setErrorOpen} />
    </div>
  );
}
