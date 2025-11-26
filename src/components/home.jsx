import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ERROR, PLAYLIST, SEGMENT } from "../constant";
import parseHls from "../lib/parseHls";
import Layout from "./layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function HomePage({ setUrl, setHeaders, setFileName }) {
  const [customHeaders, setCustomHeaders] = useState({});
  const [playlist, setPlaylist] = useState();

  function closeQualityDialog() {
    setPlaylist();
  }

  async function validateAndSetUrl(url) {
    toast.loading(`Validating...`, { duration: 800 });
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("video/mp4")) {
        setUrl(`${url}?direct=true`);
        setHeaders(customHeaders);
        return;
      }
    } catch (error) {
      // Ignore error and proceed with HLS parsing
    }

    let data = await parseHls({ hlsUrl: url, headers: customHeaders });
    if (!data) {
      // I am sure the parser lib returning, instead of throwing error
      toast.error(`Invalid url, Content possibly not parsed!`);
      return;
    }

    if (data.type === ERROR) {
      toast.error(data.data);
    } else if (data.type === PLAYLIST) {
      if (!data.data.length) {
        toast.error(`No playlist found in the url`);
      } else {
        setPlaylist(data.data);
      }
    } else if (data.type === SEGMENT) {
      setUrl(url);
      setHeaders(customHeaders);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      if (params.has("url")) {
        const url = new URL(params.get("url"));
        if (url) {
          validateAndSetUrl(url);
        }
      }
      if (params.has("filename")) {
        setFileName(params.get("filename"));
      }
    } catch (error) {}
  }, []);

  return (
    <>
      <Layout>
        <h1 className="text-3xl lg:text-4xl font-bold">Anime Realms Download</h1>
        <h2 className="mt-2 max-w-xl text-center text-muted-foreground md:text-base text-sm">
          A service to download HLS streams.
        </h2>
      </Layout>

      <Dialog open={playlist !== undefined} onOpenChange={closeQualityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="text-xl font-bold">Select Quality</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {(playlist || []).map((item) => {
              return (
                <div
                  className="flex justify-between items-center mt-2"
                  key={item.bandwidth}
                >
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUrl(item.uri);
                      setHeaders(customHeaders);
                    }}
                  >
                    {item.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
