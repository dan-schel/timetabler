/**
 * Triggers a file to be downloaded by creating a fake anchor tag and clicking
 * it. Apparently in 2022 this is still the only way to do this!?
 * @param content A text that should be in the file.
 * @param filename The default name to give the file once downloaded.
 */
export function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Triggers an open file dialog to be created, and passes the content of the
 * file chosen to the given callback. Apparently in 2022 the only way to do
 * this is STILL to create a fake input tag and simulate clicking it!?
 * @param extension The file extension including the dot, e.g. ".txt".
 * @param callback The function to call with the file content.
 */
export function openFileDialog(extension: string, callback: (content: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = extension;
  input.click();

  input.addEventListener("change", async () => {
    const files = input.files;
    if (files != null && files[0] != null) {
      callback(await files[0].text());
    }
  });
}
