// ==UserScript==
// @name         Favicon and SVG Inverter Svg not working
// @namespace    http://tampermonkey.net/
// @version      2024-08-24
// @description  Inverts dark favicons and SVGs on websites
// @downloadURL  https://github.com/scopeofaperture/tamper-invert-favicon/raw/main/script.js
// @updateURL    https://github.com/scopeofaperture/tamper-invert-favicon/raw/main/script.js
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
  // Function to get the favicon element
  const getFavicon = () => {
    return (
      document.querySelector('link[href*=".ico"]') ||
      document.querySelector('link[href*=".png"]')
    );
  };

  // Function to change the favicon
  const changeFavicon = async function () {
    const faviconEl = getFavicon();

    if (!faviconEl || faviconEl.href.includes('data:')) {
      return;
    }

    const img = new Image();

    img.crossOrigin = 'Anonymous';
    await new Promise((resolve) => {
      img.src = faviconEl.href;
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    // Get image data to analyze brightness
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const pixelCount = data.length / 4;
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);

    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

    if (brightness < 128) {  // Dark threshold
      ctx.filter = 'invert(1) hue-rotate(180deg) saturate(2)';
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL();
      faviconEl.href = dataUrl;
    }
  };

  // Function to change dark SVGs
  const changeDarkSVGs = () => {
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg) => {
      const bbox = svg.getBBox();
      const canvas = document.createElement('canvas');
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      const ctx = canvas.getContext('2d');

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        if (brightness < 128) {  // Dark threshold
          svg.style.filter = 'invert(1) hue-rotate(180deg) saturate(2)';
        }

        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  };

  // Observe favicon changes
  const favEl = getFavicon();
  if (favEl) {
    const mo = new MutationObserver(changeFavicon);
    mo.observe(favEl, { attributes: true });
  }

  changeFavicon();
  changeDarkSVGs();

  // Observe changes in the document to detect new SVGs
  const observer = new MutationObserver(() => {
    changeDarkSVGs();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

