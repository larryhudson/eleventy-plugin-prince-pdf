const nodeStaticServer = require("node-static");
const Prince = require("prince");
const http = require("http");
const lodashMerge = require("lodash.merge");

const globalOptions = {
  serverPort: 8080,
};

module.exports = function (eleventyConfig, suppliedOptions = {}) {
  let options = lodashMerge({}, globalOptions, suppliedOptions);

  eleventyConfig.on("eleventy.after", async () => {
    // Exit early if no paths supplied
    if (!options.pathsToRender || !options.pathsToRender.length > 0) {
      console.error(
        "[eleventy-plugin-prince-pdf] ERROR: Please provide PDF paths to render as array of {htmlPath, outputPath}"
      );
      return;
    }

    // Need to run a local web server because Prince works best with HTML URLs
    // (instead of HTML files on filesystem)
    const fileServer = new nodeStaticServer.Server(eleventyConfig.dir.output);

    http
      .createServer(function (request, response) {
        request
          .addListener("end", function () {
            fileServer.serve(request, response);
          })
          .resume();
      })
      .listen(options.serverPort);

    // Map through
    await Promise.all(
      pathsToOutputPdf.map(async ({ htmlPath, outputPath }) => {
        const fullOutputPath = `${eleventyConfig.dir.output}${outputPath}`;
        await Prince()
          .inputs(`http://localhost:8080${htmlPath}`)
          .output(fullOutputPath)
          .option("pdf-profile", "PDF/UA-1")
          .execute()
          .then(
            function ({ stdout }) {
              console.log(
                `[eleventy-plugin-prince-pdf]: Wrote ${fullOutputPath} from ${htmlPath}`
              );
            },
            function (stderror) {
              console.log("ERROR: ", util.inspect(stderror));
            }
          );
      })
    );
  });
};