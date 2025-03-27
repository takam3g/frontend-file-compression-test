import { useState } from 'react';
import * as fflate from 'fflate';

function FileCompressionPage() {
  const [fileOriginalSize, setFileOriginalSize] = useState<number>(0);
  const [fileCompressedSize, setFileCompressedSize] = useState<number>(0);

  const handleFileCompressFflate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return Promise.reject(new Error('No file selected'));
    setFileOriginalSize(Math.round((file.size / 1024 / 1024) * 100) / 100);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileContents = new Uint8Array(arrayBuffer);

      // Higher level means lower performance but better compression
      // The level ranges from 0 (no compression) to 9 (max compression)
      // The default level is 6
      const zlibCompressed = fflate.zlibSync(fileContents, { level: 9 });
      const gzipped = fflate.gzipSync(zlibCompressed, {
        // GZIP-specific: the filename to use when decompressed
        filename: file.name,
      });
      const compressedFile = new File([gzipped], file.name);

      setFileCompressedSize(
        Math.round((compressedFile.size / 1024 / 1024) * 100) / 100
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleFileCompressCSA = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileOriginalSize(Math.round((file.size / 1024 / 1024) * 100) / 100);

    try {
      // Import file
      const arrayBuffer = await file.arrayBuffer();
      const fileContents = new Uint8Array(arrayBuffer);

      // Convert to ReadableStream
      const fileStream = new ReadableStream({
        start(controller) {
          controller.enqueue(fileContents);
          controller.close();
        },
      });

      // Process GZIP Compress
      const compressedStream = fileStream.pipeThrough(
        new CompressionStream('gzip')
      );

      // Get compressed data as ArrayBuffer
      const response = new Response(compressedStream);
      const compressedData = await response.arrayBuffer();

      // create a file with the compressed data
      const compressedFile = new File([compressedData], file.name + '.gz', {
        type: 'application/gzip',
      });

      setFileCompressedSize(
        Math.round((compressedFile.size / 1024 / 1024) * 100) / 100
      );
    } catch (error) {
      console.error('Error compressing file:', error);
    }
  };

  return (
    <div>
      <h2>ファイル圧縮</h2>

      <h3>選択肢</h3>
      <ul style={{ textAlign: 'left', paddingLeft: 0, listStyle: 'none' }}>
        <li>
          <a href="#">pako</a>
        </li>
        <li>
          <a href="https://www.npmjs.com/package/fflate">fflate</a>
        </li>
        <li>
          <a href="https://developer.mozilla.org/ja/docs/Web/API/Compression_Streams_API">
            Compression Streams API
          </a>
        </li>
        <li>
          <a href="https://github.com/ffmpegwasm/ffmpeg.wasm">Ffmpeg.wasm</a>
        </li>
      </ul>
      <p>
        Compression Streams
        APIが全ブラウザで対応されたので、ライブラリ使わずともできる。
        ライブラリ使うのであればfflate? -
        fflate推してる記事が多いのと、Pakoはpackageが認識されない問題がある様子...
      </p>

      <h3>参考</h3>
      <ul style={{ textAlign: 'left', paddingLeft: 0, listStyle: 'none' }}>
        <li>
          <a href="https://npm-compare.com/fflate,pako">
            npm compare - pako vs fflate
          </a>
          feature-richを求めるならPako、軽量で高速なものを求めるのであればfflateとのこと
        </li>
        <li>
          <a href="https://qiita.com/muson0110/items/9e0ce53e0eeec91b3d54">
            Quiita - fflate
          </a>
        </li>
        <li>
          <a href="https://zenn.dev/niccari/articles/3350ab065a48ff">
            zenn - fflate
          </a>
        </li>
        <li>
          <a href="https://qiita.com/kerupani129/items/6c75af041c89d2a7f2f5">
            Quiita - pako & Compression Streams API
          </a>
        </li>
        <li>
          <a href="https://web.dev/blog/compressionstreams?hl=ja">
            Compression Streams API is now supported by all browsers.
          </a>
        </li>
        <li>
          <a href="https://webfrontend.ninja/js-gzip-zlib-deflate-compress/">
            How to
          </a>
        </li>
        <li>
          <a href="https://tech-blog.voicy.jp/entry/2022/07/19/101954">
            tech blog - ffmpeg.wasm
          </a>
        </li>
      </ul>

      <h3>デモ</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <label>fflate</label>
        <input type="file" onChange={handleFileCompressFflate} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <label>Compression Streams API</label>
        <input type="file" onChange={handleFileCompressCSA} />
      </div>

      <div>
        <h4>Size Check</h4>
        <p>Before: {fileOriginalSize} MB</p>
        <p>After: {fileCompressedSize} MB</p>
      </div>
    </div>
  );
}

export default FileCompressionPage;
