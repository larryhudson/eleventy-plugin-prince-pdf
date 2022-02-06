# eleventy-plugin-prince-pdf

This plugin makes it easy to generate tagged PDFs from webpages in your Eleventy site, using [Prince](https://www.princexml.com/).

## What this does

This plugin runs a function after Eleventy is finished rendering your website.

It spins up a temporary web server, so that Prince can load the URLs as if they were on a real website. This means absolute URLs beginning with `/` (eg. `/css/style.css/`) will work.

Then, Prince will convert each of the supplied paths to render (from the `pathsToRender` array in the supplied config) and write the PDFs to the output directory.

## Installation

This is not on the npm registry just yet, install with the GitHub repo:

```
npm i https://github.com/larryhudson/eleventy-plugin-prince-pdf
```

Add it to your `.eleventy.js` with a list of paths you want to render to PDF:

```
const PrincePdfPlugin = require('eleventy-plugin-prince-pdf')

module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(PrincePdfPlugin, {
    pathsToRender: [
      { htmlPath: "/hello/", outputPath: "/hello.pdf" },
      { htmlPath: "/another-pdf-page/", outputPath: "/another-pdf.pdf" },
    ],
    serverPort: 8090 // optional - set port of prince web server
  });
```

For each page in `pathsToRender`:

- `htmlPath` should be a absolute path (starting with a `/`), pointing to the webpage that you want to convert to PDF. For example, `/hello/` will try to convert `[OUTPUT_DIR]/hello/index.html`.
- `outputPath` should be a absolute path (starting with a `/`), relative to your output directory. This is where the PDF will be written to.

The `serverPort` option can be used to set the port of the web server that Prince uses when it is converting HTML to PDF. The server port defaults to `8090`.

## Configuration

At the moment this plugin does not offer any configuration.

It sets Prince's configuration to use the `PDF/UA-1` profile, so that it exports a tagged PDF that works with assistive technology.
