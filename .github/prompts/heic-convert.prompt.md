# HEIC Conversion in a Web App using heic-convert

This document explains how to integrate HEIC conversion into your web application using the [`heic-convert`](https://www.npmjs.com/package/heic-convert) package. In our use case the converted image will be stored in Firebase Storage. Since our app does not change the accepted file formats, we need to convert HEIC files to JPEG (or PNG) on the client side.

> **Note:** This documentation uses ES module syntax (i.e. using `import` instead of `require`), which suits modern React apps built with bundlers such as Webpack, Vite, or Create React App.

## Overview

`heic-convert` is a lightweight JavaScript package that leverages WebAssembly (WASM) to convert images in the HEIC/HEIF format to other formats (e.g., JPEG or PNG). Using the browser version of the package (available as `'heic-convert/browser'`), you can convert a HEIC file (provided as an ArrayBuffer or Blob) into a converted image file—all running in the browser.

## Installation

Install the package via npm:

```bash
npm install heic-convert
```

## Usage in a Web (ES Module) Environment

Since you do not use `require` in your app, import the browser version of the library as follows:

```javascript
import convert from 'heic-convert/browser';
```

### Converting a HEIC File to JPEG

Below is an example function that takes a HEIC file as input (for instance, from a file picker), converts it to JPEG, and returns a Blob. You can then use this Blob to create a File instance (if needed) before uploading it to Firebase Storage.

```javascript
/**
 * Converts a HEIC Blob to a JPEG Blob.
 *
 * @param {Blob} heicBlob - The input HEIC file blob.
 * @param {number} quality - Optional quality parameter for JPEG (0 to 1, default 1 for highest quality).
 * @returns {Promise<Blob>} - A promise that resolves with a JPEG Blob.
 */
async function convertHeicToJpeg(heicBlob, quality = 1) {
  // Convert the Blob to ArrayBuffer.
  const inputBuffer = await heicBlob.arrayBuffer();

  // Use heic-convert to convert the ArrayBuffer.
  const outputBuffer = await convert({
    buffer: inputBuffer,   // The input HEIC image buffer.
    format: 'JPEG',        // Target output format.
    quality: quality       // Compression quality from 0 to 1.
  });

  // Create a new Blob from the output buffer.
  return new Blob([outputBuffer], { type: 'image/jpeg' });
}
```

### Example: Handling an Upload from a File Input in React

Assume you have a file input component where users upload images from their gallery. If the uploaded file is in HEIC format, convert it to JPEG before sending it to Firebase Storage:

```jsx
import React from 'react';
import convert from 'heic-convert/browser';

function FileUpload({ onUpload }) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if the file is a HEIC/HEIF image by its extension.
    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      try {
        // Convert the HEIC file to JPEG.
        const convertedBlob = await convertHeicToJpeg(file);
        // Optionally, create a new File instance (e.g., to include a new filename)
        const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
        });
        // Call the upload callback with the converted file.
        onUpload(convertedFile);
      } catch (error) {
        console.error('HEIC conversion failed:', error);
      }
    } else {
      // If not HEIC, use the file as-is.
      onUpload(file);
    }
  };

  // See the helper function above.
  async function convertHeicToJpeg(heicBlob, quality = 1) {
    const inputBuffer = await heicBlob.arrayBuffer();
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality,
    });
    return new Blob([outputBuffer], { type: 'image/jpeg' });
  }

  return (
    <input
      type="file"
      accept="image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif"
      onChange={handleFileChange}
    />
  );
}

export default FileUpload;
```

## Integration with Firebase Storage

After converting the file (if necessary), you can proceed to upload the resulting file to Firebase Storage in your usual manner. For example, using Firebase’s JavaScript SDK:

```javascript
import { getStorage, ref, uploadBytes } from "firebase/storage";

async function uploadFile(file) {
  const storage = getStorage();
  const storageRef = ref(storage, `uploads/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);
  } catch (error) {
    console.error('Firebase upload failed:', error);
  }
}
```

## Considerations

- **Performance:** Converting HEIC on the browser can be CPU-intensive. If you expect high usage or very large files, consider offloading conversion to a web worker.
- **Error Handling:** Make sure to catch and handle errors from the conversion process.
- **Quality:** The `quality` parameter (for JPEG conversion) accepts values between 0 (lowest) and 1 (highest). Adjust this setting as needed.
- **Browser Support:** Ensure that your target browsers support WebAssembly. Most modern browsers do, but it's good to verify for your user base.

## Conclusion

This guide shows how to integrate HEIC conversion into your web app using `heic-convert` with ES modules. By converting HEIC files to JPEG on the client side, you ensure compatibility with Firebase Storage and other backend systems without having to change the accepted file formats.
