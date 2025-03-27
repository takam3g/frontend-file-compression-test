import { useState } from 'react';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function VideoCompressionPage() {
  const [videoOriginalSize, setVideoOriginalSize] = useState(0);
  const [videoCompressedSize, setVideoCompressedSize] = useState(0);
  const [compressedVideoLink, setCompressedVideoLink] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  const ffmpeg = createFFmpeg({ log: true });

  const handleVideoCompressFfmpeg = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setIsDone(false);
    const startTime = Date.now();

    const file = event.target.files?.[0];
    if (!file) return Promise.reject(new Error('No file selected'));
    setVideoOriginalSize(Math.round((file.size / 1024 / 1024) * 100) / 100);

    try {
      // Prep FFmpeg
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // Import selected file to ffmpeg.wasm
      ffmpeg.FS('writeFile', file.name, await fetchFile(file));

      // Process compression
      const outputFileName = 'compressed_video';
      await ffmpeg.run(
        '-i',
        file.name,
        '-vcodec',
        'libx264',
        '-crf',
        '28',
        outputFileName + '.mp4'
      ); // -crf 28 は圧縮率

      // Get compressed file
      const compressedVideo = ffmpeg.FS('readFile', outputFileName + '.mp4');
      // Compressed file to Blob => This can be sent to S3
      const videoBlob = new Blob([compressedVideo.buffer], {
        type: 'video/mp4',
      });

      setVideoCompressedSize(
        Math.round((videoBlob.size / 1024 / 1024) * 100) / 100
      );

      // Create Blob URL
      const videoUrl = URL.createObjectURL(videoBlob);
      setCompressedVideoLink(videoUrl);
      setIsDone(true);
      setProcessingTime(Date.now() - startTime);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>動画圧縮</h2>

      <h3>選択肢</h3>
      <p>やはりBEで処理するのが一般的のようだが、FEで処理するとしたら...</p>
      <a href="https://github.com/ffmpegwasm/ffmpeg.wasm">Ffmpeg.wasm</a>

      <h3>参考</h3>
      <ul style={{ textAlign: 'left', paddingLeft: 0, listStyle: 'none' }}>
        <li>
          <a href="https://tech-blog.voicy.jp/entry/2022/07/19/101954">
            tech blog - ffmpeg.wasm
          </a>
        </li>
        <li>
          <a href="https://scrapbox.io/takker/ffmpeg%E3%81%A7%E4%BD%BF%E3%81%88%E3%82%8Bcodic%E3%81%AE%E7%A2%BA%E8%AA%8D">
            codec一覧・説明
          </a>
        </li>
      </ul>

      <h3>デモ</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <label>fflate</label>
        <input type="file" onChange={handleVideoCompressFfmpeg} />
      </div>

      <div>
        <h4>Size Check</h4>
        <p>Before: {videoOriginalSize} MB</p>
        <p>After: {videoCompressedSize} MB</p>
        <p>経過: {isDone ? '完了' : 'プロセス中'}</p>
        <p>ProcessingTime: {(processingTime / 1000).toFixed(2)} 秒</p>
        <a href={compressedVideoLink} download="compressed_video.mp4">
          圧縮した動画をダウンロード
        </a>
      </div>
    </div>
  );
}

export default VideoCompressionPage;
