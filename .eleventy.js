const nodeStaticServer = require("node-static");
const Prince = require("prince");
const http = require("http");
const lodashMerge = require("lodash.merge");
const util = require("util");
const path = require("path");

const globalOptions = {
  serverPort: 8090,
};

module.exports = function (eleventyConfig, suppliedOptions = {}) {
  let options = lodashMerge({}, globalOptions, suppliedOptions);

  eleventyConfig.on("eleventy.after", async () => {
    // Exit early if no paths supplied
    if (!options.pathsToRender || !options.pathsToRender.length > 0) {
      console.error(
        "[eleventy-plugin-prince-pdf] ERROR: Provide pathsToRender as array of {htmlPath, outputPath}"
      );
      return;
    }
    
    const htmlOutputDir = options.htmlOutputDir || eleventyConfig.dir.output

    // Need to run a local web server because Prince works best with HTML URLs
    // (instead of HTML files on filesystem)
    const fileServer = new nodeStaticServer.Server(htmlOutputDir);

    const princeServer = http.createServer(function (request, response) {
      request
        .addListener("end", function () {
          fileServer.serve(request, response);
        })
        .resume();
    });

    princeServer.listen(options.serverPort);

    // Map through
    await Promise.all(
      options.pathsToRender.map(async ({ htmlPath, outputPath }) => {
        const fullOutputPath = path.join(htmlOutputDir, outputPath)
        await Prince()
          .inputs(`http://localhost:${options.serverPort}${htmlPath}`)
          .output(fullOutputPath)
          .option("pdf-profile", "PDF/UA-1")
          .execute()
          .then(
            function () {
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

    princeServer.close();
  });
};
