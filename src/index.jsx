import { useMemo, useState } from "react";
import DownloadPage from "./components/downloadPage";
import HomePage from "./components/home";

export default function MainPage() {
  const [url, setUrl] = useState();
  const [headers, setHeaders] = useState({});
  const [fileName, setFileName] = useState("");

  const segmentUrl = useMemo(() => url, [url]);

  return (
    <>
      {!url ? (
        <HomePage
          setUrl={setUrl}
          setHeaders={setHeaders}
          setFileName={setFileName}
        />
      ) : (
        <DownloadPage url={segmentUrl} headers={headers} fileName={fileName} />
      )}
    </>
  );
}
