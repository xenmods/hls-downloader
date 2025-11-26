import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { EVENTS } from "../constant";
import Layout from "./layout";
import Downloader from "../lib/download";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProgressBar } from "./ui/progress";
import { Button } from "@/components/ui/button";

// Define state constants locally
const STARTING_DOWNLOAD = "STARTING_DOWNLOAD";
const JOB_FINISHED = "JOB_FINISHED";
const DOWNLOAD_ERROR = "DOWNLOAD_ERROR";

const STATE_NAMES = {
  JOB_FINISHED: "Finished Downloading",
  STARTING_DOWNLOAD: "Download in Progress",
  DOWNLOAD_ERROR: "Failed to Download",
};

export default function DownloadPage({
  url,
  headers = {},
  fileName = `hls-downloader-${new Date()
    .toLocaleDateString()
    .replace(/[/]/g, "-")}`,
}) {
  const [downloadState, setDownloadState] = useState(STARTING_DOWNLOAD);
  const [sendHeaderWhileFetchingTS, setSendHeaderWhileFetchingTS] =
    useState(false);
  const [additionalMessage, setAdditionalMessage] = useState();
  const [downloadBlobUrl, setDownloadBlobUrl] = useState();
  const [downloadStatus, setDownloadStatus] = useState({
    completed: 0,
    total: 0,
  });

  async function startDownload() {
    setDownloadState(STARTING_DOWNLOAD);
    setAdditionalMessage(`[INFO] Job started`);

    try {
      const downloader = new Downloader({
        onEvent: (event, data) => {
          console.log(`Event: ${event}`, data);

          switch (event) {
            case EVENTS.FFMPEG_LOADING:
              setAdditionalMessage(`[INFO] Initializing ffmpeg`);
              break;
            case EVENTS.FFMPEG_LOADED:
              setAdditionalMessage(`[SUCCESS] ffmpeg loaded`);
              break;
            case EVENTS.STARTING_DOWNLOAD:
              setAdditionalMessage(`[INFO] Fetching segments`);
              break;
            case EVENTS.SOURCE_PARSED:
              setAdditionalMessage(`[INFO] Segments information fetched`);
              break;
            case EVENTS.DOWNLOADING_SEGMENTS:
              setAdditionalMessage(`[INFO] Fetching segments`);
              setDownloadStatus({
                completed: data.completed,
                total: data.total,
              });
              break;
            case EVENTS.STICHING_SEGMENTS:
              setAdditionalMessage(`[INFO] Stiching segments`);
              setDownloadStatus({
                completed: data.completed,
                total: data.total,
              });
              break;
            case EVENTS.CLEANING_UP:
              setAdditionalMessage(`[INFO] Cleaning up temporary files`);
              break;
            case EVENTS.READY_FOR_DOWNLOAD:
              setAdditionalMessage(`[INFO] Download ready!`);
              break;
          }
        },
      });

      const result = await downloader.startDownload({
        url,
        headers: sendHeaderWhileFetchingTS ? headers : {},
      });

      setDownloadBlobUrl(result.blobURL);
      setDownloadState(JOB_FINISHED);
      setAdditionalMessage();
    } catch (error) {
      console.error("Download error:", error);
      setAdditionalMessage();
      setDownloadState(DOWNLOAD_ERROR);
      toast.error(error.message || "An error occurred during download");
    }
  }

  useEffect(() => {
    startDownload();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl lg:text-3xl font-bold mb-2">
        {STATE_NAMES[downloadState]}
      </h2>
      <p className="text-muted-foreground text-sm mb-4">File: {fileName}.mp4</p>

      {Object.keys(headers).length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center"
                onClick={() =>
                  setSendHeaderWhileFetchingTS(!sendHeaderWhileFetchingTS)
                }
              >
                <Switch
                  checked={sendHeaderWhileFetchingTS}
                  className="mr-2"
                />
                Send header
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send custom header while fetching TS segments (If you are facing error, try toggling)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {additionalMessage && (
        <p className="text-muted-foreground mt-5">{additionalMessage}</p>
      )}

      {downloadBlobUrl && (
        <div className="flex gap-2 items-center">
          <Button asChild className="mt-5">
            <a href={downloadBlobUrl} download={`${fileName}.mp4`}>
              Download now
            </a>
          </Button>
        </div>
      )}

      {downloadState === STARTING_DOWNLOAD && (
        <ProgressBar
          value={(downloadStatus.completed / downloadStatus.total) * 100 || 0}
        />
      )}

      {downloadState === DOWNLOAD_ERROR && (
        <Button onClick={startDownload} className="mt-5">
          Retry
        </Button>
      )}
    </Layout>
  );
}
