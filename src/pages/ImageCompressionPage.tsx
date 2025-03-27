import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

function ImageCompressionPage() {
  const [imgOriginalSize, setImgOriginalSize] = useState(0);
  const [imgCompressedSize, setImgCompressedSize] = useState(0);
  const [compressedImgLink, setCompressedImgLink] = useState('');

  const handleImageCompress = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    setImgOriginalSize(Math.round((imageFile.size / 1024 / 1024) * 100) / 100);

    let fileToCompress = imageFile;

    if (imageFile.type === 'image/heic' || imageFile.name.endsWith('.heic')) {
      try {
        const blob = await heic2any({ blob: imageFile, toType: 'image/jpeg' });
        if (blob instanceof Blob) {
          fileToCompress = new File(
            [blob],
            imageFile.name.replace('.heic', '.jpg'),
            { type: 'image/jpeg' }
          );
        }
      } catch (error) {
        console.error('HEIC conversion error:', error);
        return;
      }
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(fileToCompress, options);
      setImgCompressedSize(
        Math.round((compressedFile.size / 1024 / 1024) * 100) / 100
      );

      const imgURL = URL.createObjectURL(compressedFile);
      setCompressedImgLink(imgURL);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>画像</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <h3>選択肢</h3>
        <p>
          <a href="https://www.npmjs.com/package/browser-image-compression">
            browser-image-compression
          </a>
          （ほぼ一択）
        </p>
        <p>
          HEIC非対応なので、
          <a href="https://www.npmjs.com/package/heic2any">heic2any</a>
          で先にJPEGに変換必要
        </p>

        <h3>参考</h3>
        <ul style={{ textAlign: 'left', paddingLeft: 0, listStyle: 'none' }}>
          <li>
            <a href="https://qiita.com/muson0110/items/9e0ce53e0eeec91b3d54">
              Quiita記事
            </a>
          </li>
          <li>
            <a href="vhttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-apphttps://stackoverflow.com/questions/47956281/best-way-to-compress-an-image-javascript-react-web-appv">
              stackoverflow
            </a>
          </li>
        </ul>

        <h3>デモ</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageCompress}
        ></input>
        <p>Before: {imgOriginalSize} MB</p>
        <p>After: {imgCompressedSize} MB</p>
        <a href={compressedImgLink}>圧縮した画像をダウンロード</a>
      </div>
    </div>
  );
}

export default ImageCompressionPage;
